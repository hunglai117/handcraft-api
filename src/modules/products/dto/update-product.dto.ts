import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { UpdateProductVariantDto } from "./update-product-variant.dto";
import { UpdateProductOptionDto } from "./update-product-option.dto";

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: "The name of the product",
    example: "Handcrafted Wooden Bowl",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: "SEO-friendly URL slug",
    example: "handcrafted-wooden-bowl",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  slug?: string;

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
  })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  @Expose()
  currency?: string;

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

  @ApiPropertyOptional({
    description: "Product variants",
    type: [UpdateProductVariantDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  @IsArray()
  @IsOptional()
  @Expose()
  variants?: UpdateProductVariantDto[];

  @ApiPropertyOptional({
    description: "Product options (e.g., Size, Color)",
    type: [UpdateProductOptionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateProductOptionDto)
  @IsArray()
  @IsOptional()
  @Expose()
  options?: UpdateProductOptionDto[];
}
