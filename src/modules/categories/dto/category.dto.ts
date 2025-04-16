import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

@Expose()
export class CategoryDto {
  @ApiProperty({
    description: "Category unique identifier (Snowflake ID)",
    example: "1234567890123456789",
    type: String,
  })
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "Home Decor",
  })
  name: string;

  @ApiProperty({
    description: "URL path for the category",
    example: "/home-decor",
  })
  pathUrl: string;

  @ApiPropertyOptional({
    description: "Parent category",
    nullable: true,
  })
  @Type(() => CategoryDto)
  parents?: CategoryDto[];

  @ApiProperty({
    description: "If this category has no subcategories",
    example: true,
  })
  isLeaf: boolean;

  @ApiPropertyOptional({
    description: "Children categories",
    nullable: true,
  })
  @Type(() => CategoryDto)
  children?: CategoryDto[];

  @ApiProperty({
    description: "Number of products in this category",
    example: 10,
  })
  productsCount: number;
}
