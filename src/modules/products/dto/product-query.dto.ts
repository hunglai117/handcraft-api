import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ToBoolean } from "src/common/decorators/dto";
import { PaginatedResponseDto } from "src/modules/shared/dtos/paginated-response.dto";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { ProductDto } from "./product.dto";

export enum ESortBy {
  NEWEST = "newest",
  PRICE_ASC = "price-asc",
  PRICE_DESC = "price-desc",
  POPULARITY = "popularity",
  TOP_SELLER = "top-seller",
}

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
    description: "Filter by stock availability (greater than 0)",
    example: true,
  })
  @IsOptional()
  @ToBoolean()
  @Expose()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: "Search in name, description, and tags",
  })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    example: ESortBy.NEWEST,
    enum: ESortBy,
  })
  @IsEnum(ESortBy)
  @IsOptional()
  @Expose()
  sortBy?: ESortBy;
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
