import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { ToBoolean } from "src/common/decorators/dto";
import { DiscountType, TargetScope } from "../entities/promotion.entity";

export class UpdatePromotionDto {
  @ApiPropertyOptional({
    description: "Promotion name",
    example: "Summer Sale 2023",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: "Promotion description",
    example: "Get 20% off all summer items",
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: "Promotion code (unique)",
    example: "SUMMER20",
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  @Expose()
  code?: string;

  @ApiPropertyOptional({
    description: "Discount type",
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  @IsOptional()
  @Expose()
  discountType?: DiscountType;

  @ApiPropertyOptional({
    description: "Discount value (percentage or fixed amount)",
    example: 20,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  @Expose()
  discountValue?: number;

  @ApiPropertyOptional({
    description: "Promotion start date",
    example: "2023-06-01T00:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Expose()
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Promotion end date",
    example: "2023-08-31T23:59:59Z",
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Expose()
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Minimum order value required to use promotion",
    example: 500000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  @Expose()
  minOrderValue?: number;

  @ApiPropertyOptional({
    description: "Target scope for the promotion",
    enum: TargetScope,
    example: TargetScope.CATEGORY,
  })
  @IsEnum(TargetScope)
  @IsOptional()
  @Expose()
  targetScope?: TargetScope;

  @ApiPropertyOptional({
    description: "Maximum number of times this promotion can be used",
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Expose()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: "Maximum number of times a user can use this promotion",
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Expose()
  usageLimitPerUser?: number;

  @ApiPropertyOptional({
    description: "Is the promotion active",
    example: true,
  })
  @IsOptional()
  @ToBoolean()
  @Expose()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Category IDs this promotion applies to (when target_scope is "category")',
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @IsOptional()
  @Expose()
  categoryIds?: string[];

  @ApiPropertyOptional({
    description:
      'Product IDs this promotion applies to (when target_scope is "product")',
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @IsOptional()
  @Expose()
  productIds?: string[];
}
