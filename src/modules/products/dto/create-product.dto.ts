import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateProductVariantDto } from "./create-product-variant.dto";
import { CreateProductOptionDto } from "./create-product-option.dto";

export class CreateProductDto {
  @ApiProperty({
    description: "The name of the product",
    example: "Handcrafted Wooden Bowl",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Detailed description of the product",
    example: "Beautiful handcrafted wooden bowl made from oak wood",
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: "Category ID of the product",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @Expose()
  category_id?: string;

  @ApiPropertyOptional({
    description: "Currency code",
    example: "VND",
    default: "VND",
  })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  @Expose()
  currency?: string = "VND";

  @ApiPropertyOptional({
    description: "Array of image URLs/paths",
    example: [
      "https://example.com/images/bowl1.jpg",
      "https://example.com/images/bowl2.jpg",
    ],
  })
  @IsJSON()
  @IsOptional()
  @Expose()
  images?: string[];

  @ApiProperty({
    description: "Product variants",
    type: [CreateProductVariantDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsArray()
  @Expose()
  variants: CreateProductVariantDto[];

  @ApiProperty({
    description: "Product options (e.g., Size, Color)",
    type: [CreateProductOptionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  @IsArray()
  @Expose()
  options: CreateProductOptionDto[];
}
