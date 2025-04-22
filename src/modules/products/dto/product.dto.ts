import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CategoryDto } from "../../categories/dto/category.dto";

export class ProductDto {
  @ApiProperty({
    description: "Product unique identifier (Snowflake ID)",
    example: "1234567890123456789",
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
    description: "Current price",
    example: 299000,
  })
  @Expose()
  price: number;

  @ApiProperty({
    description: "Original price before any discounts",
    example: 350000,
  })
  @Expose()
  originalPrice: number;

  @ApiProperty({
    description: "Currency code",
    example: "VND",
  })
  @Expose()
  currency: string;

  @ApiProperty({
    description: "Available stock quantity",
    example: 25,
  })
  @Expose()
  stockQuantity: number;

  @ApiPropertyOptional({
    description: "SKU (Stock Keeping Unit)",
    example: "HWB-001-OAK",
  })
  @Expose()
  sku?: string;

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
    description: "Product specifications",
    example: {
      dimensions: "10x10x5 cm",
      weight: "250g",
      color: "Natural Brown",
    },
  })
  @Expose()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Product tags",
    example: ["wood", "kitchen", "handmade", "eco-friendly"],
    isArray: true,
  })
  @Expose()
  tags?: string[];

  @ApiProperty({
    description: "Is the product active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: "Related product IDs",
    example: ["1234567890123456789", "1234567890123456790"],
    isArray: true,
  })
  @Expose()
  relatedProductIds?: string[];

  @ApiProperty({
    description: "Product rating",
    example: 4.5,
  })
  @Expose()
  rating: number;

  @ApiProperty({
    description: "Number of reviews",
    example: 42,
  })
  @Expose()
  reviewCount: number;

  @ApiProperty({
    description: "Number of purchases",
    example: 85,
  })
  @Expose()
  purchaseCount: number;

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
