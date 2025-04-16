import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Expose, Type } from "class-transformer";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { PaginatedResponseDto } from "src/modules/shared/dtos/paginated-response.dto";
import { ProductDto } from "./product.dto";

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by category ID",
  })
  @IsOptional()
  @Expose()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 100000,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Expose()
  minPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 500000,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Expose()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by stock availability (greater than 0)",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Expose()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: "Search in name, description, and tags",
    example: "wooden bowl",
  })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "price",
    enum: ["price", "createdAt", "rating", "purchaseCount"],
  })
  @IsString()
  @IsOptional()
  @Expose()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "DESC",
    enum: ["ASC", "DESC"],
  })
  @IsString()
  @IsOptional()
  @Expose()
  sortOrder?: "ASC" | "DESC" = "DESC";
}

export class PaginatedProductResponseDto extends PaginatedResponseDto<ProductDto> {
  @ApiProperty({
    description: "Array of product items",
    type: [ProductDto],
  })
  @Type(() => ProductDto)
  @Expose()
  items: ProductDto[];
}
