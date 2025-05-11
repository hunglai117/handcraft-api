import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { CreateProductDto } from "../../products/dto/create-product.dto";
import { ProductQueryDto } from "../../products/dto/product-query.dto";
import { UpdateProductDto } from "../../products/dto/update-product.dto";
import { Product } from "../../products/entities/product.entity";
import { ProductsService } from "../../products/products.service";

@Injectable()
export class AdminProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(queryDto: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
    } = queryDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    if (search) {
      queryBuilder.andWhere(
        "(product.name LIKE :search OR product.description LIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere("product.categoryId = :categoryId", { categoryId });
    }

    if (minPrice) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice });
    }

    if (inStock !== undefined) {
      queryBuilder.andWhere("product.stockQuantity > 0");
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.productsService.update(id, updateProductDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.productsService.remove(id);
  }

  async getProductStats() {
    // Get total product count
    const totalProducts = await this.productRepository.count();

    // Get low stock products (less than 10 items)
    const lowStockProducts = await this.productRepository
      .createQueryBuilder("product")
      .where("product.stockQuantity < :threshold", { threshold: 10 })
      .andWhere("product.stockQuantity > 0")
      .getCount();

    // Get out of stock products
    const outOfStockProducts = await this.productRepository
      .createQueryBuilder("product")
      .where("product.stockQuantity = 0")
      .getCount();

    // Get products added in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newProducts = await this.productRepository.count({
      where: {
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
    });

    // Get products by category
    const productsByCategory = await this.productRepository
      .createQueryBuilder("product")
      .leftJoin("product.category", "category")
      .select("category.name", "category")
      .addSelect("COUNT(product.id)", "count")
      .groupBy("category.name")
      .getRawMany();

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      newProducts,
      productsByCategory,
    };
  }
}
