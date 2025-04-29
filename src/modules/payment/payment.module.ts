import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { OrderModule } from "../order/order.module";
import { VnpayModule } from "nestjs-vnpay";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { consoleLogger, EndpointConfig } from "vnpay";
import { VnpayWrapperService } from "./services/vnpay-wrapper.service";
import { VnpayController } from "./controllers/vnpay.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    forwardRef(() => OrderModule),
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        tmnCode: configService.getOrThrow<string>("vnpay.tmnCode"),
        secureSecret: configService.getOrThrow<string>("vnpay.secureSecret"),
        vnpayHost: configService.getOrThrow<string>("vnpay.vnpayHost"),
        testMode: configService.getOrThrow<string>("app.env") === "development",
        enableLog: true,
        loggerFn: consoleLogger,
        endpoints: configService.getOrThrow<EndpointConfig>("vnpay.endpoints"),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VnpayController],
  providers: [VnpayWrapperService],
  exports: [VnpayWrapperService],
})
export class PaymentModule {}
