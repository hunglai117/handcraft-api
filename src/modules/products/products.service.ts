import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import slugify from "slugify";
import { PaginationHelper } from "../shared/helpers";
import { PaginatedResponseDto } from "../shared/dtos/paginated-response.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);

    if (!product.id) {
      product.generateId();
    }

    product.slug = `${slugify(product.name, { lower: true })}-p${product.id}`;

    return this.productRepository.save(product);
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      isActive = true,
      inStock = true,
      search,
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    if (categoryId) {
      queryBuilder.andWhere("product.category_id = :categoryId", {
        categoryId,
      });
    }

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

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    const [products, total] = await queryBuilder.getManyAndCount();
    return PaginationHelper.createPaginatedResponse(products, total, query);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "promotion"],
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
