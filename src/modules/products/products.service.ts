import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { EntityNotFoundException } from "../shared/exceptions/common.exception";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto): Promise<[Product[], number]> {
    const {
      category,
      minPrice,
      maxPrice,
      availability,
      search,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder("product");

    if (category) {
      queryBuilder.andWhere("product.category = :category", { category });
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

    if (availability !== undefined) {
      queryBuilder.andWhere("product.availability = :availability", {
        availability,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(product.name LIKE :search OR product.description LIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("product.createdAt", "DESC");

    return await queryBuilder.getManyAndCount();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ productID: id });
    if (!product) {
      throw new EntityNotFoundException("Product", id.toString());
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async toggleAvailability(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.availability = !product.availability;
    return await this.productRepository.save(product);
  }
}
