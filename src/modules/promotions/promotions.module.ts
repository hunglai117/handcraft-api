import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AdminPromotionsController,
  PromotionsController,
} from "./promotions.controller";
import { PromotionsService } from "./promotions.service";
import { Promotion } from "./entities/promotion.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  controllers: [AdminPromotionsController, PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
