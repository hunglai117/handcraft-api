import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { PromotionType } from "../entities/promotion.entity";

export class PromotionDto {
  @ApiProperty({
    description: "Unique identifier for the promotion (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Name of the promotion",
    example: "Black Friday Sale",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Description of the promotion",
    example: "Get 50% off on all items during Black Friday!",
  })
  @Expose()
  description: string;

  @ApiPropertyOptional({
    description: "Promotion code customers can use at checkout",
    example: "BLACKFRIDAY50",
  })
  @Expose()
  promoCode: string;

  @ApiProperty({
    description: "Start date of the promotion",
    example: "2023-11-24T00:00:00Z",
  })
  @Expose()
  startDate: Date;

  @ApiProperty({
    description: "End date of the promotion",
    example: "2023-11-30T23:59:59Z",
  })
  @Expose()
  endDate: Date;

  @ApiProperty({
    description: "Type of promotion",
    enum: PromotionType,
    example: PromotionType.PERCENTAGE_DISCOUNT,
  })
  @Expose()
  type: PromotionType;

  @ApiProperty({
    description: "Value of the discount",
    example: 50,
  })
  @Expose()
  discountValue: number;

  @ApiPropertyOptional({
    description: "Minimum order amount required to use promotion",
    example: 100.00,
  })
  @Expose()
  minimumOrderAmount: number;

  @ApiPropertyOptional({
    description: "Maximum number of times this promotion can be used",
    example: 1000,
  })
  @Expose()
  usageLimit: number;

  @ApiPropertyOptional({
    description: "Maximum number of times a user can use this promotion",
    example: 1,
  })
  @Expose()
  usageLimitPerUser: number;

  @ApiProperty({
    description: "Indicates if the promotion is active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Timestamp when the promotion was created",
    example: "2023-11-01T12:00:00Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the promotion was last updated",
    example: "2023-11-01T12:00:00Z",
  })
  @Expose()
  updatedAt: Date;
}
