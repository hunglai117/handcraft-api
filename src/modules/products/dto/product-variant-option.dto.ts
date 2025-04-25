import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ProductVariantOptionDto {
  @ApiProperty({
    description: "Variant option unique identifier (Snowflake ID)",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Variant ID this option value belongs to",
    type: String,
  })
  @Expose()
  variantId: string;

  @ApiProperty({
    description: "Option ID this value belongs to",
    type: String,
  })
  @Expose()
  optionId: string;

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
