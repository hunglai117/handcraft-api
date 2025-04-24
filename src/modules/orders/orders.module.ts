import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./controllers/orders.controller";
import { CartController } from "./controllers/cart.controller";
import { OrdersService } from "./services/orders.service";
import { CartService } from "./services/cart.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { OrderPromotion } from "./entities/order-promotion.entity";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { ProductsModule } from "../products/products.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      OrderPromotion,
      PaymentTransaction,
    ]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [OrdersController, CartController],
  providers: [OrdersService, CartService],
  exports: [OrdersService, CartService],
})
export class OrdersModule {}
