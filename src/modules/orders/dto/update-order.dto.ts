import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentMethod } from "../entities/payment-method.enum";

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: "Order status",
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  @Expose()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  @Expose()
  paymentMethod?: PaymentMethod;

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
    description: "Tracking number",
    example: "1Z999AA10123456784",
  })
  @IsString()
  @IsOptional()
  @Expose()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: "Notes",
    example: "Customer requested evening delivery",
  })
  @IsString()
  @IsOptional()
  @Expose()
  notes?: string;
}
