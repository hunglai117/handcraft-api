import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import { DiscountType, TargetScope } from "../entities/promotion.entity";

@Expose()
export class CreatePromotionDto {
  @ApiProperty({
    description: "Promotion name",
    example: "Summer Sale 2023",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: "Promotion description",
    example: "Get 20% off all summer items",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Promotion code (unique)",
    example: "SUMMER20",
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: "Discount type",
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @ApiProperty({
    description: "Discount value (percentage or fixed amount)",
    example: 20,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  discountValue: number;

  @ApiProperty({
    description: "Promotion start date",
    example: "2023-06-01T00:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: "Promotion end date",
    example: "2023-08-31T23:59:59Z",
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @ApiPropertyOptional({
    description: "Minimum order value required to use promotion",
    example: 500000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({
    description: "Target scope for the promotion",
    enum: TargetScope,
    example: TargetScope.CATEGORY,
  })
  @IsEnum(TargetScope)
  @IsNotEmpty()
  targetScope: TargetScope;

  @ApiPropertyOptional({
    description: "Maximum number of times this promotion can be used",
    example: 1000,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: "Maximum number of times a user can use this promotion",
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  usageLimitPerUser?: number;

  @ApiPropertyOptional({
    description:
      'Category IDs this promotion applies to (when target_scope is "category")',
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({
    description:
      'Product IDs this promotion applies to (when target_scope is "product")',
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  productIds?: string[];
}
