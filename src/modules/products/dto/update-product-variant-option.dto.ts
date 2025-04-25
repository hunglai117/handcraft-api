import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProductVariantOptionDto {
  @ApiProperty({
    description: "Variant Option ID",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: "Option ID this value belongs to",
  })
  @IsString()
  @IsOptional()
  @Expose()
  optionId?: string;

  @ApiPropertyOptional({
    description: "Option value (e.g., Small, Red)",
    example: "Small",
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Expose()
  value?: string;
}
