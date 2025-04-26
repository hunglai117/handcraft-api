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
import { CreateSimpleProductDto } from "./dto/create-simple-product.dto";
import { getRankArray } from "src/common/utils";

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
          featuredImage: createProductDto.featuredImage,
          inStock: false, // Default to false until we check variants
        });

        if (!product.id) {
          product.generateId();
        }

        product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;

        // Create and save product options
        const options: ProductOption[] = [];
        for (const optionDto of createProductDto.options) {
          const option = this.productOptionRepository.create({
            name: optionDto.name,
            productId: product.id,
          });
          option.generateId();
          options.push(option);
        }

        await transactionalEntityManager.save(options);

        // Create and save product variants and variant options
        let minPrice: number | null = null;
        let maxPrice: number | null = null;
        let hasStock = false; // Track if any variant has stock

        const optionRanks = getRankArray(options.map((o) => o.name));

        for (const variantDto of createProductDto.variants) {
          const variant = this.productVariantRepository.create({
            title: variantDto.title,
            price: variantDto.price,
            sku: variantDto.sku,
            stockQuantity: variantDto.stockQuantity,
            weight: variantDto.weight,
            image: variantDto.image,
            productId: product.id,
          });
          variant.generateId();
          await transactionalEntityManager.save(variant);

          // Check if variant has stock
          if (variant.stockQuantity > 0) {
            hasStock = true;
          }

          // Track min/max price for the product
          if (minPrice === null || variant.price < minPrice) {
            minPrice = variant.price;
          }
          if (maxPrice === null || variant.price > maxPrice) {
            maxPrice = variant.price;
          }

          // Create and save variant options
          const variantOptions: ProductVariantOption[] = [];
          for (const [
            index,
            variantOptionDto,
          ] of variantDto.variantOptions.entries()) {
            const variantOption = this.productVariantOptionRepository.create({
              variantId: variant.id,
              optionId: options[index].id,
              value: variantOptionDto.value,
              orderIndex: optionRanks[index],
            });
            variantOption.generateId();
            variantOptions.push(variantOption);
          }

          await transactionalEntityManager.save(variantOptions);
        }

        product.priceMin = minPrice || 0;
        product.priceMax = maxPrice || 0;
        product.inStock = hasStock; // Set inStock based on variant stock quantities
        await transactionalEntityManager.save(product);

        return product.id;
      },
    );

    return this.findOne(productId);
  }

  async createSimpleProduct(
    createSimpleProductDto: CreateSimpleProductDto,
  ): Promise<Product> {
    const productId = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const product = this.productRepository.create({
          name: createSimpleProductDto.name,
          description: createSimpleProductDto.description,
          category_id: createSimpleProductDto.category_id,
          currency: createSimpleProductDto.currency || "VND",
          images: createSimpleProductDto.images,
          featuredImage: createSimpleProductDto.featuredImage,
          priceMin: createSimpleProductDto.price,
          priceMax: createSimpleProductDto.price,
          inStock: (createSimpleProductDto.stockQuantity || 0) > 0, // Set based on stock quantity
        });

        if (!product.id) {
          product.generateId();
        }

        product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;
        await transactionalEntityManager.save(product);

        const variant = this.productVariantRepository.create({
          title: createSimpleProductDto.name,
          price: createSimpleProductDto.price,
          sku: createSimpleProductDto.sku,
          stockQuantity: createSimpleProductDto.stockQuantity || 0,
          weight: createSimpleProductDto.weight,
          image: createSimpleProductDto.featuredImage,
          productId: product.id,
        });

        variant.generateId();
        await transactionalEntityManager.save(variant);

        return product.id;
      },
    );

    return this.findOne(productId);
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const { page, limit, sortBy, ...filters } = query;
    const skip = (page - 1) * limit;

    let queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.options", "options")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("variants.variantOptions", "variantOptions")
      .orderBy("options.name", "ASC")
      .addOrderBy("variantOptions.orderIndex", "ASC");

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
    const { categoryId, minPrice, maxPrice, inStock, search } = query;

    if (categoryId) {
      const leafCategoryIds =
        await this.categoriesService.getLeafCategoriesId(categoryId);
      queryBuilder.andWhere("product.category_id IN (:...leafCategoryIds)", {
        leafCategoryIds,
      });
    }

    queryBuilder = this.applyPriceFilters(queryBuilder, minPrice, maxPrice);

    if (inStock !== undefined) {
      queryBuilder.andWhere("product.inStock = :inStock", { inStock });
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
    const product = await this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.options", "options")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("variants.variantOptions", "variantOptions")
      .where("product.id = :id", { id })
      .orderBy("options.name", "ASC")
      .addOrderBy("variantOptions.orderIndex", "ASC")
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.options", "options")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("variants.variantOptions", "variantOptions")
      .where("product.slug = :slug", { slug })
      .orderBy("options.name", "ASC")
      .addOrderBy("variantOptions.orderIndex", "ASC")
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
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

      if (updateProductDto.featuredImage !== undefined) {
        product.featuredImage = updateProductDto.featuredImage;
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
              productId: product.id,
            });
            newOption.generateId();
            await transactionalEntityManager.save(newOption);
            product.options.push(newOption);
          }
        }
      }

      // Update product variants if provided
      let hasStock = false;
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      if (updateProductDto.variants) {
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

              // Check stock status
              if (variant.stockQuantity > 0) {
                hasStock = true;
              }

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
              productId: product.id,
            });
            newVariant.generateId();
            await transactionalEntityManager.save(newVariant);

            // Check stock status
            if (newVariant.stockQuantity > 0) {
              hasStock = true;
            }

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

        // Update product price range and stock status
        if (minPrice !== null && maxPrice !== null) {
          product.priceMin = minPrice;
          product.priceMax = maxPrice;
        }
      } else {
        // If variants were not updated, check existing variants for stock
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            if (variant.stockQuantity > 0) {
              hasStock = true;
              break;
            }
          }
        }
      }

      // Update inStock status
      product.inStock = hasStock;
      await transactionalEntityManager.save(product);
    });

    // Return updated product with all relations
    return this.findOne(product.id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
