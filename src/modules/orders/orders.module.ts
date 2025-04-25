import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bull";
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
import { ProductVariant } from "../products/entities/product-variant.entity";
import { RedisModule } from "../redis/redis.module";
import { MessagingModule } from "../messaging/messaging.module";
import { OrderQueueModule } from "./queues/order.queue.module";
import { OrderEventsListener } from "../messaging/order-events.listener";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      OrderPromotion,
      PaymentTransaction,
      ProductVariant,
    ]),
    BullModule.registerQueue({
      name: "orders",
    }),
    ProductsModule,
    UsersModule,
    RedisModule,
    MessagingModule,
    OrderQueueModule,
  ],
  controllers: [OrdersController, CartController, OrderEventsListener],
  providers: [OrdersService, CartService],
  exports: [OrdersService, CartService],
})
export class OrdersModule {}
