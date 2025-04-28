import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentController } from "./controllers/payment.controller";
import { PaymentService } from "./services/payment.service";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { OrderModule } from "../order/order.module";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction]), OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
