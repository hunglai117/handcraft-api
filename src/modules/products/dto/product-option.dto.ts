import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ProductOptionDto {
  @ApiProperty({
    description: "Option unique identifier (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Product ID this option belongs to",
    example: "9876543210987654321",
    type: String,
  })
  @Expose()
  product_id: string;

  @ApiProperty({
    description: "Option name",
    example: "Size",
  })
  @Expose()
  name: string;

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
