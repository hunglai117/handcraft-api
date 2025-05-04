import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";
import { Promotion } from "./entities/promotion.entity";

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    if (
      createPromotionDto.startDate &&
      createPromotionDto.endDate &&
      createPromotionDto.startDate >= createPromotionDto.endDate
    ) {
      throw new BadRequestException("End date must be after start date");
    }

    const promotion = this.promotionRepository.create(createPromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { promoCode: code },
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
      promotion.endDate &&
      updatePromotionDto.startDate >= promotion.endDate
    ) {
      throw new BadRequestException("Start date must be before end date");
    } else if (
      updatePromotionDto.endDate &&
      promotion.startDate &&
      promotion.startDate >= updatePromotionDto.endDate
    ) {
      throw new BadRequestException("End date must be after start date");
    }

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

      if (
        !promotion.isActive ||
        promotion.startDate > now ||
        (promotion.endDate && promotion.endDate < now)
      ) {
        return { valid: false, message: "Promotion is not active" };
      }

      if (promotion.startDate > now) {
        return { valid: false, message: "Promotion has not started yet" };
      }

      if (promotion.endDate && promotion.endDate < now) {
        return { valid: false, message: "Promotion has expired" };
      }

      return { valid: true, promotion };
    } catch {
      return { valid: false, message: "Invalid promotion code" };
    }
  }

  async findActivePromotionsWithAvailableUsage(): Promise<{
    promotions: Promotion[];
    count: number;
  }> {
    const now = new Date();

    const [promotions, count] = await this.promotionRepository
      .createQueryBuilder("promotion")
      .where("promotion.isActive = :isActive", { isActive: true })
      .andWhere("promotion.usageCount <= promotion.usageLimit")
      .andWhere("promotion.startDate <= :now", { now })
      .andWhere("promotion.endDate > :now", { now })
      .getManyAndCount();

    return { promotions, count };
  }
}
