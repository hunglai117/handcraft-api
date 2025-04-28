import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
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
import { PromotionType } from "../entities/promotion.entity";

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
  promoCode?: string;

  @ApiPropertyOptional({
    description: "Promotion type",
    enum: PromotionType,
    example: PromotionType.PERCENTAGE_DISCOUNT,
  })
  @IsEnum(PromotionType)
  @IsOptional()
  @Expose()
  type?: PromotionType;

  @ApiPropertyOptional({
    description: "Discount value (percentage, fixed amount, etc.)",
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
    description: "Minimum order amount required to use promotion",
    example: 500000,
  })
  @IsDecimal({ decimal_digits: "2" })
  @IsOptional()
  @Expose()
  minimumOrderAmount?: number;

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
    description: "Is the promotion active",
    example: true,
  })
  @IsOptional()
  @ToBoolean()
  @Expose()
  isActive?: boolean;
}
