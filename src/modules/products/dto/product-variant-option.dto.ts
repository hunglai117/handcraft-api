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
    description: "Option value",
    example: "Small",
  })
  @Expose()
  value: string;
}
