import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateProductVariantOptionDto {
  @ApiProperty({
    description: "Option value (e.g., Small, Red)",
    example: "Small",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  value: string;
}
