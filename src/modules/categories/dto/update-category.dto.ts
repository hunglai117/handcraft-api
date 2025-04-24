import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { ToBoolean } from "./get-category.dto";

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: "Category name",
    example: "Home Decor",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: "URL path for the category",
    example: "/home-decor",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  pathUrl?: string;

  @ApiPropertyOptional({
    description: "Category image URL or path",
    example: "https://example.com/images/home-decor.jpg",
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Expose()
  image?: string;

  @ApiPropertyOptional({
    description: "Parent category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    nullable: true,
  })
  @IsOptional()
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Whether this category has no subcategories",
    example: true,
  })
  @IsOptional()
  @ToBoolean()
  @Expose()
  isLeaf?: boolean;
}
