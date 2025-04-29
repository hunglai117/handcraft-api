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
// import { OrderProcessor } from "./processors/order.processor";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderPromotion,
      ProductVariant,
    ]),
    BullModule.registerQueue({
      name: "orders",
    }),
    RedisModule,
    CartModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    // OrderProcessor
  ],
  exports: [OrderService],
})
export class OrderModule {}
