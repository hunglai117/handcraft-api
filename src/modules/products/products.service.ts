import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { ESortBy, ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductVariant } from "./entities/product-variant.entity";
import { ProductOption } from "./entities/product-option.entity";
import { ProductVariantOption } from "./entities/product-variant-option.entity";
import slugify from "slugify";
import { PaginationHelper } from "../shared/helpers";
import { PaginatedResponseDto } from "../shared/dtos/paginated-response.dto";
import { CategoriesService } from "../categories/categories.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductOption)
    private productOptionRepository: Repository<ProductOption>,
    @InjectRepository(ProductVariantOption)
    private productVariantOptionRepository: Repository<ProductVariantOption>,
    private categoriesService: CategoriesService,
    private dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const productId = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // Create product
        const product = this.productRepository.create({
          name: createProductDto.name,
          description: createProductDto.description,
          category_id: createProductDto.category_id,
          currency: createProductDto.currency || "VND",
          images: createProductDto.images,
        });

        if (!product.id) {
          product.generateId();
        }

        product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;

        await transactionalEntityManager.save(product);

        // Create and save product options
        const options: ProductOption[] = [];
        for (const optionDto of createProductDto.options) {
          const option = this.productOptionRepository.create({
            name: optionDto.name,
            product_id: product.id,
          });
          option.generateId();
          await transactionalEntityManager.save(option);
          options.push(option);
        }

        // Create and save product variants and variant options
        let minPrice: number | null = null;
        let maxPrice: number | null = null;

        for (const variantDto of createProductDto.variants) {
          const variant = this.productVariantRepository.create({
            title: variantDto.title,
            price: variantDto.price,
            sku: variantDto.sku,
            stockQuantity: variantDto.stockQuantity,
            weight: variantDto.weight,
            image: variantDto.image,
            product_id: product.id,
          });
          variant.generateId();
          await transactionalEntityManager.save(variant);

          // Track min/max price for the product
          if (minPrice === null || variant.price < minPrice) {
            minPrice = variant.price;
          }
          if (maxPrice === null || variant.price > maxPrice) {
            maxPrice = variant.price;
          }

          // Create and save variant options
          for (const [
            index,
            variantOptionDto,
          ] of variantDto.variantOptions.entries()) {
            const variantOption = this.productVariantOptionRepository.create({
              variantId: variant.id,
              optionId: options[index].id,
              value: variantOptionDto.value,
            });
            variantOption.generateId();
            await transactionalEntityManager.save(variantOption);
          }
        }

        // Update product with price information
        product.priceMin = minPrice || 0;
        product.priceMax = maxPrice || 0;
        await transactionalEntityManager.save(product);

        return product.id;
      },
    );

    return this.findOne(productId);
  }

  /**
   * Find all products with filtering, sorting and pagination
   */
  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const { page, limit, sortBy, ...filters } = query;
    const skip = (page - 1) * limit;

    let queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    queryBuilder = await this.applyFilters(queryBuilder, filters);
    queryBuilder = this.applySorting(queryBuilder, sortBy);
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return PaginationHelper.createPaginatedResponse(products, total, query);
  }

  private async applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    query: Omit<ProductQueryDto, "page" | "limit" | "sortBy">,
  ): Promise<SelectQueryBuilder<Product>> {
    const { categoryId, minPrice, maxPrice, inStock = true, search } = query;

    if (categoryId) {
      const leafCategoryIds =
        await this.categoriesService.getLeafCategoriesId(categoryId);
      queryBuilder.andWhere("product.category_id IN (:...leafCategoryIds)", {
        leafCategoryIds,
      });
    }

    queryBuilder = this.applyPriceFilters(queryBuilder, minPrice, maxPrice);

    if (inStock === true) {
      // For products with variants, we need to check if any variant has stock
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("variant.product_id")
          .from(ProductVariant, "variant")
          .where("variant.stock_quantity > 0")
          .getQuery();
        return `product.id IN ${subQuery}`;
      });
    } else if (inStock === false) {
      // All variants must be out of stock
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("variant.product_id")
          .from(ProductVariant, "variant")
          .where("variant.stock_quantity > 0")
          .getQuery();
        return `product.id NOT IN ${subQuery}`;
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          product.name ILIKE :search 
          OR product.description ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    return queryBuilder;
  }

  private applyPriceFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    minPrice?: number,
    maxPrice?: number,
  ): SelectQueryBuilder<Product> {
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere(
        "product.price_min <= :maxPrice AND product.price_max >= :minPrice",
        {
          minPrice,
          maxPrice,
        },
      );
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price_max >= :minPrice", { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price_min <= :maxPrice", { maxPrice });
    }

    return queryBuilder;
  }

  /**
   * Apply sorting based on sortBy parameter
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Product>,
    sortBy: ESortBy = ESortBy.NEWEST,
  ): SelectQueryBuilder<Product> {
    switch (sortBy) {
      case ESortBy.NEWEST:
        queryBuilder.orderBy("product.createdAt", "DESC");
        break;
      case ESortBy.PRICE_ASC:
        queryBuilder.orderBy("product.price_min", "ASC");
        break;
      case ESortBy.PRICE_DESC:
        queryBuilder.orderBy("product.price_max", "DESC");
        break;
      default:
        queryBuilder.orderBy("product.createdAt", "DESC");
        break;
    }
    return queryBuilder;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "options", "variants", "variants.variantOptions"],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Load option values for each variant
    for (const variant of product.variants) {
      for (const variantOption of variant.variantOptions) {
        // Find the option this value belongs to
        const option = product.options.find(
          (o) => o.id === variantOption.optionId,
        );
        if (option) {
          variantOption.option = option;
        }
      }
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ["category", "options", "variants", "variants.variantOptions"],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Load option values for each variant
    for (const variant of product.variants) {
      for (const variantOption of variant.variantOptions) {
        // Find the option this value belongs to
        const option = product.options.find(
          (o) => o.id === variantOption.optionId,
        );
        if (option) {
          variantOption.option = option;
        }
      }
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Update basic product fields
      if (updateProductDto.name) {
        product.name = updateProductDto.name;
        product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;
      }

      if (updateProductDto.description !== undefined) {
        product.description = updateProductDto.description;
      }

      if (updateProductDto.category_id !== undefined) {
        product.category_id = updateProductDto.category_id;
      }

      if (updateProductDto.currency !== undefined) {
        product.currency = updateProductDto.currency;
      }

      if (updateProductDto.images !== undefined) {
        product.images = updateProductDto.images;
      }

      await transactionalEntityManager.save(product);

      // Update product options if provided
      if (updateProductDto.options) {
        for (const optionDto of updateProductDto.options) {
          if (optionDto.id) {
            // Update existing option
            const option = product.options.find((o) => o.id === optionDto.id);
            if (option && optionDto.name) {
              option.name = optionDto.name;
              await transactionalEntityManager.save(option);
            }
          } else {
            // Create new option
            const newOption = this.productOptionRepository.create({
              name: optionDto.name,
              product_id: product.id,
            });
            newOption.generateId();
            await transactionalEntityManager.save(newOption);
            product.options.push(newOption);
          }
        }
      }

      // Update product variants if provided
      if (updateProductDto.variants) {
        let minPrice: number | null = null;
        let maxPrice: number | null = null;

        for (const variantDto of updateProductDto.variants) {
          if (variantDto.id) {
            // Update existing variant
            const variant = product.variants.find(
              (v) => v.id === variantDto.id,
            );
            if (variant) {
              if (variantDto.title !== undefined) {
                variant.title = variantDto.title;
              }

              if (variantDto.price !== undefined) {
                variant.price = variantDto.price;
              }

              if (variantDto.sku !== undefined) {
                variant.sku = variantDto.sku;
              }

              if (variantDto.stockQuantity !== undefined) {
                variant.stockQuantity = variantDto.stockQuantity;
              }

              if (variantDto.weight !== undefined) {
                variant.weight = variantDto.weight;
              }

              if (variantDto.image !== undefined) {
                variant.image = variantDto.image;
              }

              await transactionalEntityManager.save(variant);

              // Update variant options if provided
              if (variantDto.variantOptions) {
                for (const optionValueDto of variantDto.variantOptions) {
                  if (optionValueDto.id) {
                    // Update existing option value
                    const variantOption = variant.variantOptions.find(
                      (vo) => vo.id === optionValueDto.id,
                    );

                    if (variantOption) {
                      if (optionValueDto.optionId !== undefined) {
                        variantOption.optionId = optionValueDto.optionId;
                      }

                      if (optionValueDto.value !== undefined) {
                        variantOption.value = optionValueDto.value;
                      }

                      await transactionalEntityManager.save(variantOption);
                    }
                  } else {
                    // Create new option value
                    const newVariantOption =
                      this.productVariantOptionRepository.create({
                        variantId: variant.id,
                        optionId: optionValueDto.optionId,
                        value: optionValueDto.value,
                      });
                    newVariantOption.generateId();
                    await transactionalEntityManager.save(newVariantOption);
                  }
                }
              }

              // Track min/max price
              if (minPrice === null || variant.price < minPrice) {
                minPrice = variant.price;
              }
              if (maxPrice === null || variant.price > maxPrice) {
                maxPrice = variant.price;
              }
            }
          } else {
            // Create new variant
            const newVariant = this.productVariantRepository.create({
              title: variantDto.title,
              price: variantDto.price,
              sku: variantDto.sku,
              stockQuantity: variantDto.stockQuantity || 0,
              weight: variantDto.weight,
              image: variantDto.image,
              product_id: product.id,
            });
            newVariant.generateId();
            await transactionalEntityManager.save(newVariant);

            // Create new variant options
            if (variantDto.variantOptions) {
              for (const optionValueDto of variantDto.variantOptions) {
                const newVariantOption =
                  this.productVariantOptionRepository.create({
                    variantId: newVariant.id,
                    optionId: optionValueDto.optionId,
                    value: optionValueDto.value,
                  });
                newVariantOption.generateId();
                await transactionalEntityManager.save(newVariantOption);
              }
            }

            // Track min/max price
            if (minPrice === null || newVariant.price < minPrice) {
              minPrice = newVariant.price;
            }
            if (maxPrice === null || newVariant.price > maxPrice) {
              maxPrice = newVariant.price;
            }

            product.variants.push(newVariant);
          }
        }

        // Update product price range
        if (minPrice !== null && maxPrice !== null) {
          product.priceMin = minPrice;
          product.priceMax = maxPrice;
          await transactionalEntityManager.save(product);
        }
      }
    });

    // Return updated product with all relations
    return this.findOne(product.id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    // Cascading delete will handle variants, options and their relations
  }
}
