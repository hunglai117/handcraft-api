import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { UserDto } from "../../users/dto/user.dto";

export class CreateProductRatingDto {
  @ApiProperty({
    description: "Rating value (1-5)",
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Expose()
  rating: number;

  @ApiPropertyOptional({
    description: "Comment about the product",
    example: "Great product, highly recommended!",
  })
  @IsString()
  @IsOptional()
  @Expose()
  comment?: string;
}

export class ProductRatingDto {
  @ApiProperty({
    description: "Rating unique identifier (Snowflake ID)",
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Product ID that this rating belongs to",
    type: String,
  })
  @Expose()
  productId: string;

  @ApiProperty({
    description: "User who created the rating",
  })
  @Type(() => UserDto)
  @Expose()
  user: UserDto;

  @ApiProperty({
    description: "Rating value (1-5)",
    example: 5,
  })
  @Expose()
  rating: number;

  @ApiPropertyOptional({
    description: "Comment about the product",
    example: "Great product, highly recommended!",
  })
  @Expose()
  comment?: string;

  @ApiProperty({
    description: "Whether the rating is from a verified purchase",
    example: true,
  })
  @Expose()
  isVerifiedPurchase: boolean;

  @ApiProperty({
    description: "Count of users who found this review helpful",
    example: 12,
  })
  @Expose()
  helpfulCount: number;

  @ApiProperty({
    description: "Rating creation date",
    example: "2023-05-15T14:30:00Z",
  })
  @Expose()
  createdAt: Date;
}

export class UpdateProductRatingDto {
  @ApiPropertyOptional({
    description: "Rating value (1-5)",
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Expose()
  rating?: number;

  @ApiPropertyOptional({
    description: "Comment about the product",
    example:
      "After using it for a while, I'm still satisfied but there are some minor issues.",
  })
  @IsString()
  @IsOptional()
  @Expose()
  comment?: string;
}

export class ProductRatingResponseDto {
  @ApiProperty({
    description: "Average rating of the product",
    example: 4.5,
  })
  @Expose()
  averageRating: number;

  @ApiProperty({
    description: "Total number of ratings",
    example: 120,
  })
  @Expose()
  totalRatings: number;

  @ApiProperty({
    description: "Rating distribution",
    example: {
      5: 80,
      4: 25,
      3: 10,
      2: 3,
      1: 2,
    },
  })
  @Expose()
  distribution: Record<number, number>;

  @ApiProperty({
    description: "List of ratings",
    type: [ProductRatingDto],
  })
  @Type(() => ProductRatingDto)
  @Expose()
  ratings: ProductRatingDto[];
}
