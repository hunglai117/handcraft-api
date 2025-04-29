import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import {
  AdminProductsController,
  PublicProductsController,
} from "./products.controller";
import { Product } from "./entities/product.entity";
import { ProductVariant } from "./entities/product-variant.entity";
import { ProductOption } from "./entities/product-option.entity";
import { ProductVariantOption } from "./entities/product-variant-option.entity";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductOption,
      ProductVariantOption,
    ]),
    CategoriesModule,
  ],
  controllers: [AdminProductsController, PublicProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
