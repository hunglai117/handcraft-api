import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ProductVariantOptionDto {
  @ApiProperty({
    description: "Variant option unique identifier (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Variant ID this option value belongs to",
    example: "9876543210987654321",
    type: String,
  })
  @Expose()
  variant_id: string;

  @ApiProperty({
    description: "Option ID this value belongs to",
    example: "5555555555555555555",
    type: String,
  })
  @Expose()
  option_id: string;

  @ApiProperty({
    description: "Option value",
    example: "Small",
  })
  @Expose()
  value: string;

  @ApiProperty({
    description: "Created date and time",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last updated date and time",
  })
  @Expose()
  updatedAt: Date;
}
