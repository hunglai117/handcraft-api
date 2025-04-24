import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PaymentTransactionDto {
  @ApiProperty({
    description: "Payment transaction unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Order this payment applies to",
    example: "9876543210987654321",
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: "External transaction ID from payment gateway",
    example: "txn_1234567890abcdef",
  })
  @Expose()
  transactionId: string;

  @ApiProperty({
    description: "Payment method used",
    example: "credit_card",
    enum: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
  })
  @Expose()
  paymentMethod: string;

  @ApiProperty({
    description: "Payment amount",
    example: 150000,
  })
  @Expose()
  amount: number;

  @ApiProperty({
    description: "Payment status",
    example: "completed",
    enum: ["pending", "completed", "failed", "refunded"],
  })
  @Expose()
  paymentStatus: string;

  @ApiProperty({
    description: "Created timestamp",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last updated timestamp",
  })
  @Expose()
  updatedAt: Date;
}
