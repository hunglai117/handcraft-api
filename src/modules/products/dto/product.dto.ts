import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CategoryDto } from "../../categories/dto/category.dto";
import { ProductVariantDto } from "./product-variant.dto";
import { ProductOptionDto } from "./product-option.dto";

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

  @ApiProperty({
    description: "Whether the product has price variations",
    example: true,
  })
  @Expose()
  priceVaries: boolean;

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

  @ApiPropertyOptional({
    description: "Product variants",
    type: [ProductVariantDto],
  })
  @Expose()
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

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
  createdAt: Date;

  @ApiProperty({
    description: "Last updated date and time",
  })
  @Expose()
  updatedAt: Date;
}
