import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class PaymentInfoDto {
  @ApiProperty({
    description: "Payment method",
    example: "credit_card",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  paymentMethod: string;

  @ApiPropertyOptional({
    description:
      "Additional payment details needed for processing, varies by payment method",
    example: {
      cardNumber: "xxxx-xxxx-xxxx-1234",
      expiryMonth: "12",
      expiryYear: "2025",
      cvv: "***",
    },
  })
  @IsOptional()
  @IsObject()
  @Expose()
  paymentDetails?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Transaction ID from external payment gateway",
    example: "txn_1234567890",
  })
  @IsOptional()
  @IsString()
  @Expose()
  transactionId?: string;
}
