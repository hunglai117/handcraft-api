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
            urls: [
              `amqp://${configService.get("RABBITMQ_USER", "guest")}:${configService.get(
                "RABBITMQ_PASSWORD",
                "guest",
              )}@${configService.get("RABBITMQ_HOST", "localhost")}:${configService.get(
                "RABBITMQ_PORT",
                "5672",
              )}`,
            ],
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
