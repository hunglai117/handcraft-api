import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

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

  @ApiProperty({
    description: "Start date of the promotion",
    example: "2023-11-24T00:00:00Z",
  })
  @Expose()
  @Expose()
  startDate: Date;

  @ApiProperty({
    description: "End date of the promotion",
    example: "2023-11-30T23:59:59Z",
  })
  @Expose()
  @Expose()
  endDate: Date;

  @ApiProperty({
    description: "Target scope of the promotion",
    enum: ["ALL", "CATEGORY", "PRODUCT"],
    example: "CATEGORY",
  })
  @Expose()
  discountType: string;

  @ApiProperty({
    description: "Value of the discount",
    example: 50,
  })
  @Expose()
  discountValue: number;

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
