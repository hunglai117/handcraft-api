import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MessagingService } from "./messaging.service";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "ORDER_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>("rabbitmq.url")],
            queue: "order_events_queue",
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
    ConfigModule,
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
