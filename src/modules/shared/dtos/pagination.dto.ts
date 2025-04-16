import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Page number (starts from 1)",
    default: 1,
    minimum: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value || 1)
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 30,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value || 30)
  limit?: number;
}
