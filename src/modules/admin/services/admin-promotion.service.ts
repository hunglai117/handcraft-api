import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Promotion } from "../../promotions/entities/promotion.entity";
import { PromotionsService } from "../../promotions/promotions.service";
import { CreatePromotionDto } from "../../promotions/dto/create-promotion.dto";
import { UpdatePromotionDto } from "../../promotions/dto/update-promotion.dto";

@Injectable()
export class AdminPromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly promotionsService: PromotionsService,
  ) {}

  async findAll(includeInactive: boolean = true) {
    if (includeInactive) {
      return this.promotionRepository.find({
        order: { createdAt: "DESC" },
      });
    }

    // Get only active promotions
    const now = new Date();
    return this.promotionRepository
      .createQueryBuilder("promotion")
      .where("promotion.isActive = :isActive", { isActive: true })
      .andWhere("promotion.startDate <= :now", { now })
      .andWhere("promotion.endDate > :now", { now })
      .orderBy("promotion.createdAt", "DESC")
      .getMany();
  }

  async findOne(id: string) {
    const promotion = await this.promotionRepository.findOneBy({ id });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async create(createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    // Check if promotion exists before updating
    await this.findOne(id);
    return this.promotionsService.update(id, updatePromotionDto);
  }

  async remove(id: string) {
    // Check if promotion exists before removing
    await this.findOne(id);
    return this.promotionsService.remove(id);
  }

  async toggleActive(id: string) {
    return this.promotionsService.toggleActive(id);
  }

  async getPromotionStats() {
    // Get total promotion count
    const totalPromotions = await this.promotionRepository.count();

    // Get active promotions
    const activePromotions = await this.promotionRepository.count({
      where: { isActive: true },
    });

    // Get expired promotions (endDate in the past)
    const expiredPromotions = await this.promotionRepository.count({
      where: {
        endDate: Between(new Date("2000-01-01"), new Date()),
      },
    });

    // Get promotions by type
    const promotionsByType = await this.promotionRepository
      .createQueryBuilder("promotion")
      .select("promotion.type", "type")
      .addSelect("COUNT(promotion.id)", "count")
      .groupBy("promotion.type")
      .getRawMany();

    // Get upcoming promotions (future startDate)
    const upcomingPromotions = await this.promotionRepository.count({
      where: {
        startDate: Between(new Date(), new Date("2100-01-01")),
      },
    });

    return {
      totalPromotions,
      activePromotions,
      expiredPromotions,
      upcomingPromotions,
      promotionsByType,
    };
  }
}
