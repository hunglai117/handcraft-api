import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { UpdateProductVariantOptionDto } from "./update-product-variant-option.dto";

export class UpdateProductVariantDto {
  @ApiProperty({
    description: "Variant ID",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: "Variant title",
    example: "Small / Blue",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  title?: string;

  @ApiPropertyOptional({
    description: "Variant price",
    example: 299000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  @Expose()
  price?: number;

  @ApiPropertyOptional({
    description: "SKU (Stock Keeping Unit)",
    example: "HWB-001-S-BLUE",
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  @Expose()
  sku?: string;

  @ApiPropertyOptional({
    description: "Stock quantity",
    example: 25,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Expose()
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: "Weight in grams",
    example: 250,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  @Expose()
  weight?: number;

  @ApiPropertyOptional({
    description: "Variant image",
    example: "https://example.com/images/bowl1-small-blue.jpg",
  })
  @IsString()
  @IsOptional()
  @Expose()
  image?: string;

  @ApiPropertyOptional({
    description: "Variant option values",
    type: [UpdateProductVariantOptionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantOptionDto)
  @IsArray()
  @IsOptional()
  @Expose()
  variantOptions?: UpdateProductVariantOptionDto[];
}
