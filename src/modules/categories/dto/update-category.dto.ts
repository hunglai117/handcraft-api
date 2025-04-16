import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

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
  @IsBoolean()
  @IsOptional()
  @Expose()
  isLeaf?: boolean;
}
