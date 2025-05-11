import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class StockCheckItemDto {
  @ApiProperty({
    description: "Product ID to check stock for",
    example: "1234567890123456789",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  productId: string;

  @ApiProperty({
    description: "Quantity to check",
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsPositive()
  @Expose()
  quantity: number;
}

export class StockCheckRequestDto {
  @ApiProperty({
    description: "List of products to check stock for",
    type: [StockCheckItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockCheckItemDto)
  @Expose()
  items: StockCheckItemDto[];
}

export class StockCheckResultDto {
  @ApiProperty({
    description: "Product ID that was checked",
    example: "1234567890123456789",
  })
  @Expose()
  productId: string;

  @ApiProperty({
    description: "Product name",
    example: "Handcrafted Wooden Bowl",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Available stock quantity",
    example: 25,
  })
  @Expose()
  availableStock: number;

  @ApiProperty({
    description: "Requested quantity",
    example: 2,
  })
  @Expose()
  requestedQuantity: number;

  @ApiProperty({
    description: "Whether the product has sufficient stock",
    example: true,
  })
  @Expose()
  hasStock: boolean;
}

export class StockCheckResponseDto {
  @ApiProperty({
    description: "Results of stock check",
    type: [StockCheckResultDto],
  })
  @Expose()
  @Type(() => StockCheckResultDto)
  results: StockCheckResultDto[];

  @ApiProperty({
    description: "Whether all products have sufficient stock",
    example: true,
  })
  @Expose()
  allAvailable: boolean;
}
