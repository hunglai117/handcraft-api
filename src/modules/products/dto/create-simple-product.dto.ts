import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateSimpleProductDto {
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
  })
  @IsOptional()
  @Expose()
  category_id?: string;

  @ApiProperty({
    description: "Price of the product",
    example: 250000,
  })
  @IsNumber()
  @IsPositive()
  @Expose()
  price: number;

  @ApiPropertyOptional({
    description: "SKU (Stock Keeping Unit) of the product",
    example: "WB-001",
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Expose()
  sku?: string;

  @ApiPropertyOptional({
    description: "Available stock quantity",
    example: 10,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  stockQuantity?: number = 0;

  @ApiPropertyOptional({
    description: "Weight of the product in grams",
    example: 500,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  weight?: number;

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
    type: [String],
  })
  @IsOptional()
  @Expose()
  images?: string[];

  @ApiPropertyOptional({
    description: "URL/path of the featured image for the product",
    example: "https://example.com/images/bowl1.jpg",
  })
  @IsString()
  @IsOptional()
  @Expose()
  featuredImage?: string;
}
