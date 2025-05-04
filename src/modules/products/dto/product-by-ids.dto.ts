import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class ProductByIdsQueryDto {
  @ApiProperty({
    description: "Comma-separated list of product IDs",
    example: "12345,67890",
    type: String,
  })
  @Transform(({ value }) => value.split(",")) // Use double quotes for split
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Expose()
  productIds: string[];
}
