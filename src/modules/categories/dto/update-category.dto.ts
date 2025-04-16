import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

@Expose()
export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: "Category name",
    example: "Home Decor",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: "URL path for the category",
    example: "/home-decor",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  pathUrl?: string;

  @ApiPropertyOptional({
    description: "Parent category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: "Whether this category has no subcategories",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isLeaf?: boolean;
}
