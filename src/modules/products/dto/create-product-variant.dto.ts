import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateProductVariantOptionDto } from "./create-product-variant-option.dto";

export class CreateProductVariantDto {
  @ApiProperty({
    description: "Variant title",
    example: "Small / Blue",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Expose()
  title: string;

  @ApiProperty({
    description: "Variant price",
    example: 299000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  @Expose()
  price: number;

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
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Expose()
  stockQuantity?: number = 0;

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

  @ApiProperty({
    description: "Variant option values",
    type: [CreateProductVariantOptionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantOptionDto)
  @Expose()
  variantOptions: CreateProductVariantOptionDto[];
}
