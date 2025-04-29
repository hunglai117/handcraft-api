import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { CartController } from "./controllers/cart.controller";
import { CartService } from "./services/cart.service";
import { ProductsModule } from "../products/products.module";
import { RedisModule } from "../redis/redis.module";
import { ProductVariant } from "../products/entities/product-variant.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, ProductVariant]),
    ProductsModule,
    RedisModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
