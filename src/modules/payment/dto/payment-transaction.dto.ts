import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PaymentTransactionDto {
  @ApiProperty({
    description: "Payment transaction ID",
    example: "8466048709824514",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2025-05-09T01:41:03.250Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last updated timestamp",
    example: "2025-05-09T01:43:50.757Z",
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: "Order ID",
    example: "8466048500109312",
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: "Payment method",
    example: "vnpay",
  })
  @Expose()
  paymentMethod: string;

  @ApiProperty({
    description: "Payment amount",
    example: "460000.00",
  })
  @Expose()
  amount: string;

  @ApiProperty({
    description: "Payment status",
    example: "completed",
  })
  @Expose()
  paymentStatus: string;

  @ApiPropertyOptional({
    description: "Payment gateway metadata",
    example: {
      transactionId: "14947695",
      bankCode: "NCB",
      cardType: "ATM",
      payDate: "20250509154409",
      responseCode: "00",
      bankTranNo: "VNP14947695",
    },
  })
  @Expose()
  metadata?: Record<string, any>;
}
