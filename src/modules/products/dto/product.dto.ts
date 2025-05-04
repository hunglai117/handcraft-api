import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CategoryDto } from "../../categories/dto/category.dto";
import { ProductVariantDto } from "./product-variant.dto";
import { ProductOptionDto } from "./product-option.dto";

class ProductVariantProductDto extends OmitType(ProductVariantDto, [
  "productId",
] as const) {}

export class ProductDto {
  @ApiProperty({
    description: "Product unique identifier (Snowflake ID)",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Product name",
    example: "Handcrafted Wooden Bowl",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "SEO-friendly URL slug",
    example: "handcrafted-wooden-bowl",
  })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Beautiful handcrafted wooden bowl made from sustainable oak wood",
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: "Category information",
  })
  @Expose()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @ApiProperty({
    description: "Currency code",
    example: "VND",
  })
  @Expose()
  currency: string;

  @ApiPropertyOptional({
    description: "Product images",
    example: [
      "https://example.com/images/bowl1.jpg",
      "https://example.com/images/bowl2.jpg",
    ],
    isArray: true,
  })
  @Expose()
  images?: string[];

  @ApiPropertyOptional({
    description: "Product thumbnail image",
    example: "https://example.com/images/bowl_thumbnail.jpg",
  })
  @Expose()
  featuredImage?: string;

  @ApiProperty({
    description: "Minimum price across all variants",
    example: 299000,
  })
  @Expose()
  priceMin: number;

  @ApiProperty({
    description: "Maximum price across all variants",
    example: 350000,
  })
  @Expose()
  priceMax: number;

  @ApiProperty({
    description: "Number of times the product has been purchased",
    example: 120,
    default: 0,
  })
  @Expose()
  purchaseCount: number;

  @ApiProperty({
    description: "Product rating (0-5)",
    example: 4,
    default: 0,
  })
  @Expose()
  rating: number;

  @ApiPropertyOptional({
    description: "Product variants",
    type: [ProductVariantDto],
  })
  @Expose()
  @Type(() => ProductVariantProductDto)
  variants?: ProductVariantProductDto[];

  @ApiPropertyOptional({
    description: "Product options",
    type: [ProductOptionDto],
  })
  @Expose()
  @Type(() => ProductOptionDto)
  options?: ProductOptionDto[];

  @ApiProperty({
    description: "Created date and time",
  })
  @Expose()
  createdAt?: Date;

  @ApiProperty({
    description: "Last updated date and time",
  })
  @Expose()
  updatedAt?: Date;
}
