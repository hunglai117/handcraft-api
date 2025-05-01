import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VnpayModule } from "nestjs-vnpay";
import { consoleLogger, EndpointConfig } from "vnpay";
import { SharedModule } from "../shared/shared.module";
import { VnpayController } from "./controllers/vnpay.controller";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { VnpayWrapperService } from "./services/vnpay-wrapper.service";

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([PaymentTransaction]),
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
