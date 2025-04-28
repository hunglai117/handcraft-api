import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "../entities/payment-method.enum";

export class PaymentInfoDto {
  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  @Expose()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: "Transaction ID from payment gateway (if available)",
    example: "txn_1234567890",
  })
  @IsString()
  @IsOptional()
  @Expose()
  transactionId?: string;

  @ApiPropertyOptional({
    description: "Payment gateway reference (e.g., PayPal, Stripe)",
    example: "stripe",
  })
  @IsString()
  @IsOptional()
  @Expose()
  paymentGateway?: string;
}
