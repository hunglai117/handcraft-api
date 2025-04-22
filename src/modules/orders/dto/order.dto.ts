import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentMethod } from "../entities/payment-method.enum";
import { OrderItemResponseDto } from "./order-item.dto";

export class OrderDto {
  @Expose()
  @ApiProperty({
    description: "Order unique identifier",
    example: "1234567890123456789",
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: "User ID",
    example: "1234567890123456789",
  })
  userId: string;

  @Expose()
  @ApiProperty({
    description: "Order status",
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Expose()
  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  paymentMethod: PaymentMethod;

  @Expose()
  @ApiProperty({
    description: "Total order amount",
    example: 599000,
  })
  totalAmount: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Shipping address",
    example: "123 Main St, Apt 4B",
  })
  shippingAddress?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Shipping city",
    example: "New York",
  })
  shippingCity?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Shipping state/province",
    example: "NY",
  })
  shippingState?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Shipping zip/postal code",
    example: "10001",
  })
  shippingZip?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Shipping country",
    example: "USA",
  })
  shippingCountry?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Tracking number",
    example: "1Z999AA10123456784",
  })
  trackingNumber?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes for the order",
    example: "Please deliver in the afternoon",
  })
  notes?: string;

  @Expose()
  @ApiProperty({
    description: "Order created date",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "Order last updated date",
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: "Order items",
    type: [OrderItemResponseDto],
  })
  @Type(() => OrderItemResponseDto)
  orderItems: OrderItemResponseDto[];
}
