import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

@Expose()
export class PromotionDto {
  @ApiProperty({
    description: "Unique identifier for the promotion (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  id: string;

  @ApiProperty({
    description: "Name of the promotion",
    example: "Black Friday Sale",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Description of the promotion",
    example: "Get 50% off on all items during Black Friday!",
  })
  description: string;

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
    description: "Target scope of the promotion",
    enum: ["ALL", "CATEGORY", "PRODUCT"],
    example: "CATEGORY",
  })
  discountType: string;

  @ApiProperty({
    description: "Value of the discount",
    example: 50,
  })
  discountValue: number;

  @ApiProperty({
    description: "Indicates if the promotion is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Timestamp when the promotion was created",
    example: "2023-11-01T12:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the promotion was last updated",
    example: "2023-11-01T12:00:00Z",
  })
  updatedAt: Date;
}
