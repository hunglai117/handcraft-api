import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: "Filter by category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "Filter by promotion ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsOptional()
  promotionId?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 100000,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 500000,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by stock availability (greater than 0)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  @ApiPropertyOptional({
    description: "Search in name, description, and tags",
    example: "wooden bowl",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: "Page number",
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "price",
    enum: ["price", "createdAt", "rating", "viewCount", "purchaseCount"],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "DESC",
    enum: ["ASC", "DESC"],
  })
  @IsString()
  @IsOptional()
  sortOrder?: "ASC" | "DESC" = "DESC";
}
