import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class CategoryDto {
  @ApiProperty({
    description: "Category unique identifier (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "Home Decor",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "URL path for the category",
    example: "/home-decor",
  })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: "Category image URL or path",
    example: "https://example.com/images/home-decor.jpg",
    nullable: true,
  })
  @Expose()
  image?: string;

  @ApiPropertyOptional({
    description: "Parent category",
    nullable: true,
  })
  @Type(() => CategoryDto)
  @Expose()
  parents?: CategoryDto[];

  @ApiProperty({
    description: "If this category has no subcategories",
    example: true,
  })
  @Expose()
  isLeaf: boolean;

  @ApiPropertyOptional({
    description: "Children categories",
    nullable: true,
  })
  @Type(() => CategoryDto)
  @Expose()
  children?: CategoryDto[];

  @ApiProperty({
    description: "Number of products in this category",
    example: 10,
  })
  @Expose()
  productsCount: number;
}
