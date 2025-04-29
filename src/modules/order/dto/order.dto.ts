/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";
import { OrderPromotionDto } from "./order-promotion.dto";
import { OrderStatus } from "../entities/order-status.enum";

export class OrderDto {
  @ApiProperty({
    description: "Order unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Current order status",
    example: "pending",
    enum: OrderStatus,
  })
  @Expose()
  orderStatus: string;

  @ApiProperty({
    description: "Total order amount",
    example: 150000,
  })
  @Expose()
  totalAmount: number;

  @ApiProperty({
    description: "Current payment status",
    example: "unpaid",
    enum: ["unpaid", "paid", "refunded", "partially_refunded", "failed"],
  })
  @Expose()
  paymentStatus: string;

  @ApiProperty({
    description: "Shipping address",
    type: Object,
  })
  @Expose()
  shippingAddress: Record<string, any>;

  @ApiProperty({
    description: "Billing address",
    type: Object,
  })
  @Expose()
  billingAddress: Record<string, any>;

  @ApiProperty({
    description: "Items in the order",
    type: [OrderItemDto],
  })
  @Expose()
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiPropertyOptional({
    description: "Applied promotions",
    type: [OrderPromotionDto],
  })
  @Expose()
  @Type(() => OrderPromotionDto)
  orderPromotions?: OrderPromotionDto[];

  @ApiPropertyOptional({
    description: "Payment URL for online payment",
    example: "https://payment.example.com/transaction/123456",
  })
  @Expose()
  paymentUrl?: string;
}
