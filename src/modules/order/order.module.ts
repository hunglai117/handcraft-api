import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bull";
import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderPromotion } from "./entities/order-promotion.entity";
import { ProductVariant } from "../products/entities/product-variant.entity";
import { CartModule } from "../cart/cart.module";
import { RedisModule } from "../redis/redis.module";
import { PaymentModule } from "../payment/payment.module";
import { PaymentTransaction } from "../payment/entities/payment-transaction.entity";
import { SharedModule } from "../shared/shared.module";
import { OrderProcessService } from "./services/order-process.service";
import { PromotionsModule } from "../promotions/promotions.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderPromotion,
      ProductVariant,
      PaymentTransaction,
    ]),
    BullModule.registerQueue({
      name: "orders",
    }),
    RedisModule,
    CartModule,
    PaymentModule,
    SharedModule,
    PromotionsModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessService],
  exports: [OrderService, OrderProcessService],
})
export class OrderModule {}
