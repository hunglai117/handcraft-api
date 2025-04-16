import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromotionsController } from "./promotions.controller";
import { PromotionsService } from "./promotions.service";
import { Promotion } from "./entities/promotion.entity";
import { Category } from "../categories/entities/category.entity";
import { Product } from "../products/entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Category, Product])],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
