import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Expose, Type } from "class-transformer";

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

  @ApiProperty({
    description: "Current sale price in VND",
    example: 299000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  @Expose()
  price: number;

  @ApiProperty({
    description: "Original price before any discount/promotion in VND",
    example: 350000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  @Expose()
  originalPrice: number;

  @ApiPropertyOptional({
    description: "Currency code",
    example: "VND",
    default: "VND",
  })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  @Expose()
  currency?: string = "VND";

  @ApiPropertyOptional({
    description: "Stock quantity",
    example: 100,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Expose()
  stockQuantity?: number = 0;

  @ApiPropertyOptional({
    description: "Product SKU (unique)",
    example: "HWB-001-OAK",
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  @Expose()
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
  @Expose()
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
  @Expose()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Tags for the product",
    example: "wood,kitchen,handmade,eco-friendly",
  })
  @IsArray()
  @IsOptional()
  @Expose()
  tags?: string[];

  @ApiPropertyOptional({
    description: "Product availability status",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Expose()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: "Related product IDs",
    example: [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ],
  })
  @IsArray()
  @IsOptional()
  @Expose()
  relatedProductIds?: string[];
}
