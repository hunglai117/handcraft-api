import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ProductOptionDto {
  @ApiProperty({
    description: "Option unique identifier (Snowflake ID)",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Option name",
    example: "Size",
  })
  @Expose()
  name: string;
}
