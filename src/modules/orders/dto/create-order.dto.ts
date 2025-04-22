import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PaymentMethod } from "../entities/payment-method.enum";
import { OrderItemDto } from "./order-item.dto";

export class CreateOrderDto {
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
    description: "Shipping address",
    example: "123 Main St, Apt 4B",
  })
  @IsString()
  @IsOptional()
  @Expose()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: "Shipping city",
    example: "New York",
  })
  @IsString()
  @IsOptional()
  @Expose()
  shippingCity?: string;

  @ApiPropertyOptional({
    description: "Shipping state/province",
    example: "NY",
  })
  @IsString()
  @IsOptional()
  @Expose()
  shippingState?: string;

  @ApiPropertyOptional({
    description: "Shipping zip/postal code",
    example: "10001",
  })
  @IsString()
  @IsOptional()
  @Expose()
  shippingZip?: string;

  @ApiPropertyOptional({
    description: "Shipping country",
    example: "USA",
  })
  @IsString()
  @IsOptional()
  @Expose()
  shippingCountry?: string;

  @ApiPropertyOptional({
    description: "Additional notes for the order",
    example: "Please deliver in the afternoon",
  })
  @IsString()
  @IsOptional()
  @Expose()
  notes?: string;

  @ApiProperty({
    description: "Array of order items",
    type: [OrderItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  @Expose()
  orderItems: OrderItemDto[];
}
