import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrderPromotionDto {
  @ApiProperty({
    description: "Order promotion unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Order this promotion applies to",
    example: "9876543210987654321",
  })
  @Expose()
  orderId: string;

  @ApiPropertyOptional({
    description: "Promotion identifier",
    example: "5555555555555555555",
  })
  @Expose()
  promotionId?: string;

  @ApiProperty({
    description: "Discount amount applied to the order",
    example: 25000,
  })
  @Expose()
  discountAmount: number;

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
