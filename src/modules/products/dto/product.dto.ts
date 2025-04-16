import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CategoryDto } from "../../categories/dto/category.dto";
import { PromotionDto } from "../../promotions/dto/promotion.dto";

@Expose()
export class ProductDto {
  @ApiProperty({
    description: "Product unique identifier (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  id: string;

  @ApiProperty({
    description: "Product name",
    example: "Handcrafted Wooden Bowl",
  })
  name: string;

  @ApiProperty({
    description: "SEO-friendly URL slug",
    example: "handcrafted-wooden-bowl",
  })
  slug: string;

  @ApiPropertyOptional({
    description: "Product description",
    example: "Beautiful handcrafted wooden bowl made from sustainable oak wood",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Category ID",
    example: "1234567890123456789",
    type: String,
  })
  category_id?: string;

  @ApiPropertyOptional({
    description: "Category information",
  })
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @ApiProperty({
    description: "Current price",
    example: 299000,
  })
  price: number;

  @ApiProperty({
    description: "Original price before any discounts",
    example: 350000,
  })
  originalPrice: number;

  @ApiProperty({
    description: "Currency code",
    example: "VND",
  })
  currency: string;

  @ApiProperty({
    description: "Available stock quantity",
    example: 25,
  })
  stockQuantity: number;

  @ApiPropertyOptional({
    description: "SKU (Stock Keeping Unit)",
    example: "HWB-001-OAK",
  })
  sku?: string;

  @ApiPropertyOptional({
    description: "Product images",
    example: [
      "https://example.com/images/bowl1.jpg",
      "https://example.com/images/bowl2.jpg",
    ],
    isArray: true,
  })
  images?: string[];

  @ApiPropertyOptional({
    description: "Product specifications",
    example: {
      dimensions: "10x10x5 cm",
      weight: "250g",
      color: "Natural Brown",
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Product tags",
    example: ["wood", "kitchen", "handmade", "eco-friendly"],
    isArray: true,
  })
  tags?: string[];

  @ApiProperty({
    description: "Is the product active",
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: "Promotion ID",
    example: "1234567890123456789",
    type: String,
  })
  promotion_id?: string;

  @ApiPropertyOptional({
    description: "Promotion information",
  })
  @Type(() => PromotionDto)
  promotion?: PromotionDto;

  @ApiPropertyOptional({
    description: "Related product IDs",
    example: ["1234567890123456789", "1234567890123456790"],
    isArray: true,
  })
  relatedProductIds?: string[];

  @ApiProperty({
    description: "Product rating",
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: "Number of reviews",
    example: 42,
  })
  reviewCount: number;

  @ApiProperty({
    description: "Number of views",
    example: 1250,
  })
  viewCount: number;

  @ApiProperty({
    description: "Number of purchases",
    example: 85,
  })
  purchaseCount: number;

  @ApiProperty({
    description: "Created date and time",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last updated date and time",
  })
  updatedAt: Date;
}
