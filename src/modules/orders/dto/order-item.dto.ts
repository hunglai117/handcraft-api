import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class OrderItemDto {
  @ApiProperty({
    description: "Product ID",
    example: "1234567890123456789",
  })
  @IsNotEmpty()
  @Expose()
  productId: string;

  @ApiProperty({
    description: "Quantity of product",
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: "Additional notes for this item",
    example: "Gift wrap please",
  })
  @IsString()
  @IsOptional()
  @Expose()
  notes?: string;
}

export class OrderItemResponseDto {
  @Expose()
  @ApiProperty({
    description: "Order item unique identifier",
    example: "1234567890123456789",
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: "Product ID",
    example: "1234567890123456789",
  })
  productId: string;

  @Expose()
  @ApiProperty({
    description: "Product name",
    example: "Handcrafted Wooden Bowl",
  })
  productName: string;

  @Expose()
  @ApiProperty({
    description: "Quantity of product",
    example: 2,
  })
  quantity: number;

  @Expose()
  @ApiProperty({
    description: "Unit price",
    example: 299000,
  })
  unitPrice: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Discount amount per unit",
    example: 20000,
  })
  discountAmount?: number;

  @Expose()
  @ApiPropertyOptional({
    description: "Additional notes for this item",
    example: "Gift wrap please",
  })
  productNotes?: string;
}
