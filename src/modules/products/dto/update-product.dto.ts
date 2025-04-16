import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: "The name of the product",
    example: "Handcrafted Wooden Bowl",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: "SEO-friendly URL slug",
    example: "handcrafted-wooden-bowl",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: "Detailed description of the product",
    example: "Beautiful handcrafted wooden bowl made from oak wood",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Category ID of the product",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({
    description: "Current sale price in VND",
    example: 299000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: "Original price before any discount/promotion in VND",
    example: 350000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({
    description: "Currency code",
    example: "VND",
  })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: "Stock quantity",
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: "Product SKU (unique)",
    example: "HWB-001-OAK",
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: "Array of image URLs/paths",
    example: [
      "https://example.com/images/bowl1.jpg",
      "https://example.com/images/bowl2.jpg",
    ],
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: "Structured product specifications",
    example: {
      dimensions: "10x10x5 cm",
      weight: "250g",
      color: "Natural Brown",
    },
  })
  @IsJSON()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Materials used to make the product",
    example: "Oak wood, natural varnish",
  })
  @IsString()
  @IsOptional()
  materials?: string;

  @ApiPropertyOptional({
    description: "Tags for the product",
    example: "wood,kitchen,handmade,eco-friendly",
  })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({
    description: "Product availability status",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Promotion ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsOptional()
  promotion_id?: string;

  @ApiPropertyOptional({
    description: "Related product IDs",
    example: [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ],
  })
  @IsArray()
  @IsOptional()
  relatedProductIds?: string[];
}
