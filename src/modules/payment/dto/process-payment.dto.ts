import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { PaymentMethod } from "../enums/payment-method.enum";

class CardDetailsDto {
  @ApiProperty({ description: "Card number" })
  @IsNotEmpty()
  number: string;

  @ApiProperty({ description: "Card holder name" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Expiration month" })
  @IsNotEmpty()
  expiryMonth: string;

  @ApiProperty({ description: "Expiration year" })
  @IsNotEmpty()
  expiryYear: string;

  @ApiProperty({ description: "CVV/CVC security code" })
  @IsNotEmpty()
  cvv: string;
}

class PaypalDetailsDto {
  @ApiProperty({ description: "PayPal payment token" })
  @IsNotEmpty()
  paymentToken: string;

  @ApiProperty({ description: "PayPal payer ID" })
  @IsNotEmpty()
  payerId: string;
}

export class ProcessPaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    description: "Payment method",
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: "Transaction ID if already generated" })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    type: CardDetailsDto,
    description: "Credit card details (required for credit card payments)",
  })
  @ValidateIf((o) => o.method === PaymentMethod.CREDIT_CARD)
  @IsObject()
  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;

  @ApiPropertyOptional({
    type: PaypalDetailsDto,
    description: "PayPal details (required for PayPal payments)",
  })
  @ValidateIf((o) => o.method === PaymentMethod.PAYPAL)
  @IsObject()
  @ValidateNested()
  @Type(() => PaypalDetailsDto)
  paypalDetails?: PaypalDetailsDto;

  @ApiPropertyOptional({
    description: "Additional payment metadata",
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
