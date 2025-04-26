import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ProductVariantOptionDto } from "./product-variant-option.dto";

export class ProductVariantDto {
  @ApiProperty({
    description: "Variant unique identifier (Snowflake ID)",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Product ID this variant belongs to",
    type: String,
  })
  @Expose()
  productId: string;

  @ApiProperty({
    description: "Variant title",
    example: "Small / Blue",
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: "Variant price",
    example: 299000,
  })
  @Expose()
  price: number;

  @ApiPropertyOptional({
    description: "SKU (Stock Keeping Unit)",
    example: "HWB-001-S-BLUE",
  })
  @Expose()
  sku?: string;

  @ApiProperty({
    description: "Available stock quantity",
    example: 25,
  })
  @Expose()
  stockQuantity: number;

  @ApiPropertyOptional({
    description: "Weight in grams",
    example: 250,
  })
  @Expose()
  weight?: number;

  @ApiPropertyOptional({
    description: "Variant image",
    example: "https://example.com/images/bowl1-small-blue.jpg",
  })
  @Expose()
  image?: string;

  @ApiPropertyOptional({
    description: "Variant options",
    type: [ProductVariantOptionDto],
  })
  @Expose()
  @Type(() => ProductVariantOptionDto)
  variantOptions?: ProductVariantOptionDto[];

  @ApiProperty({
    description: "Created date and time",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last updated date and time",
  })
  @Expose()
  updatedAt: Date;
}
