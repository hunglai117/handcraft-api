import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OrderProcessor } from "./order.processor";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { OrderPromotion } from "../entities/order-promotion.entity";
import { RedisModule } from "../../redis/redis.module";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow<string>("redis.host"),
          port: configService.getOrThrow<number>("redis.port"),
          password: configService.getOrThrow<string>("redis.password"),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue({
      name: "orders",
    }),
    TypeOrmModule.forFeature([Order, OrderItem, OrderPromotion]),
    RedisModule,
  ],
  providers: [OrderProcessor],
  exports: [BullModule],
})
export class OrderQueueModule {}
