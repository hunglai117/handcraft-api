import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../categories/entities/category.entity";
import { Product } from "../products/entities/product.entity";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";
import { Promotion, TargetScope } from "./entities/promotion.entity";

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    if (createPromotionDto.startDate >= createPromotionDto.endDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const promotion = this.promotionRepository.create(createPromotionDto);

    if (createPromotionDto.targetScope === TargetScope.CATEGORY) {
      if (
        !createPromotionDto.categoryIds ||
        createPromotionDto.categoryIds.length === 0
      ) {
        throw new BadRequestException(
          "Category IDs are required when target scope is category",
        );
      }

      promotion.categories = await Promise.all(
        createPromotionDto.categoryIds.map(async (id) => {
          const category = await this.categoryRepository.findOne({
            where: { id },
          });
          if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
          }
          return category;
        }),
      );
    } else if (createPromotionDto.targetScope === TargetScope.PRODUCT) {
      if (
        !createPromotionDto.productIds ||
        createPromotionDto.productIds.length === 0
      ) {
        throw new BadRequestException(
          "Product IDs are required when target scope is product",
        );
      }

      promotion.products = await Promise.all(
        createPromotionDto.productIds.map(async (id) => {
          const product = await this.productRepository.findOne({
            where: { id },
          });
          if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
          }
          return product;
        }),
      );
    }

    return this.promotionRepository.save(promotion);
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ["categories", "products"],
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
      relations: ["categories", "products"],
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with code ${code} not found`);
    }

    return promotion;
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (updatePromotionDto.startDate && updatePromotionDto.endDate) {
      if (updatePromotionDto.startDate >= updatePromotionDto.endDate) {
        throw new BadRequestException("End date must be after start date");
      }
    } else if (
      updatePromotionDto.startDate &&
      updatePromotionDto.startDate >= promotion.endDate
    ) {
      throw new BadRequestException("Start date must be before end date");
    } else if (
      updatePromotionDto.endDate &&
      promotion.startDate >= updatePromotionDto.endDate
    ) {
      throw new BadRequestException("End date must be after start date");
    }

    if (
      updatePromotionDto.targetScope === TargetScope.CATEGORY &&
      updatePromotionDto.categoryIds
    ) {
      promotion.categories = await Promise.all(
        updatePromotionDto.categoryIds.map(async (id) => {
          const category = await this.categoryRepository.findOne({
            where: { id },
          });
          if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
          }
          return category;
        }),
      );
    } else if (
      updatePromotionDto.targetScope === TargetScope.PRODUCT &&
      updatePromotionDto.productIds
    ) {
      promotion.products = await Promise.all(
        updatePromotionDto.productIds.map(async (id) => {
          const product = await this.productRepository.findOne({
            where: { id },
          });
          if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
          }
          return product;
        }),
      );
    }

    delete updatePromotionDto.categoryIds;
    delete updatePromotionDto.productIds;

    Object.assign(promotion, updatePromotionDto);

    return this.promotionRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }

  async toggleActive(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.isActive = !promotion.isActive;
    return this.promotionRepository.save(promotion);
  }

  async validatePromoCode(
    code: string,
  ): Promise<{ valid: boolean; promotion?: Promotion; message?: string }> {
    try {
      const promotion = await this.findByCode(code);
      const now = new Date();

      if (!promotion.isActive) {
        return { valid: false, message: "Promotion is not active" };
      }

      if (promotion.startDate > now) {
        return { valid: false, message: "Promotion has not started yet" };
      }

      if (promotion.endDate < now) {
        return { valid: false, message: "Promotion has expired" };
      }

      // Additional validation could be added here for usage limits, etc.

      return { valid: true, promotion };
    } catch {
      return { valid: false, message: "Invalid promotion code" };
    }
  }
}
