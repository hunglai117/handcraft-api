import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { ESortBy, ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import slugify from "slugify";
import { PaginationHelper } from "../shared/helpers";
import { PaginatedResponseDto } from "../shared/dtos/paginated-response.dto";
import { CategoriesService } from "../categories/categories.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);

    if (!product.id) {
      product.generateId();
    }

    product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;

    return this.productRepository.save(product);
  }

  /**
   * Find all products with filtering, sorting and pagination
   */
  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const { page, limit, sortBy, ...filters } = query;
    console.log("query", query);
    const skip = (page - 1) * limit;

    let queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    queryBuilder = await this.applyFilters(queryBuilder, filters);

    queryBuilder = this.applySorting(queryBuilder, sortBy);

    queryBuilder.skip(skip).take(limit);
    console.log("queryBuilder", queryBuilder.getSql());
    console.log("queryBuilder parameters", queryBuilder.getParameters());
    const [products, total] = await queryBuilder.getManyAndCount();

    return PaginationHelper.createPaginatedResponse(products, total, query);
  }

  private async applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    query: Omit<ProductQueryDto, "page" | "limit" | "sortBy">,
  ): Promise<SelectQueryBuilder<Product>> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      isActive = true,
      inStock = true,
      search,
    } = query;
    if (categoryId) {
      const leafCategoryIds =
        await this.categoriesService.getLeafCategoriesId(categoryId);
      queryBuilder.andWhere("product.category_id IN (:...leafCategoryIds)", {
        leafCategoryIds,
      });
    }

    queryBuilder = this.applyPriceFilters(queryBuilder, minPrice, maxPrice);

    if (isActive !== undefined) {
      queryBuilder.andWhere("product.is_active = :isActive", {
        isActive,
      });
    }

    if (inStock === true) {
      queryBuilder.andWhere("product.stock_quantity > 0");
    } else if (inStock === false) {
      queryBuilder.andWhere("product.stock_quantity = 0");
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          product.name ILIKE :search 
          OR product.description ILIKE :search 
          OR product.tags ILIKE :search
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
      queryBuilder.andWhere("product.price BETWEEN :minPrice AND :maxPrice", {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice });
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
        queryBuilder.orderBy("product.price", "ASC");
        break;
      case ESortBy.PRICE_DESC:
        queryBuilder.orderBy("product.price", "DESC");
        break;
      case ESortBy.POPULARITY:
        queryBuilder.orderBy("product.rating", "DESC");
        break;
      case ESortBy.TOP_SELLER:
        queryBuilder.orderBy("product.purchaseCount", "DESC");
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
      relations: ["category"],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ["category"],
    });

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

    Object.assign(product, updateProductDto);

    if (updateProductDto.name) {
      product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async toggleActive(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = !product.isActive;
    return this.productRepository.save(product);
  }
}
