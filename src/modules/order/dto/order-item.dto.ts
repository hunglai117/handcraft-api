import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject } from "class-validator";

class ProductVariantDto {
  @ApiProperty({
    description: "Product variant ID",
    example: "123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Product variant title",
    example: "Blue, Size M",
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: "Product variant SKU",
    example: "PROD-BLU-M",
  })
  @Expose()
  sku: string;
}

export class OrderItemDto {
  @ApiProperty({
    description: "Order item ID",
    example: "1234567890",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Order ID",
    example: "9876543210",
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: "Product variant ID",
    example: "123456789",
  })
  @Expose()
  productVariantId: string;

  @ApiProperty({
    description: "Product variant",
    type: ProductVariantDto,
  })
  @Expose()
  @Type(() => ProductVariantDto)
  productVariant: ProductVariantDto;

  @ApiProperty({
    description: "Quantity of items",
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  quantity: number;

  @ApiProperty({
    description: "Unit price",
    example: 25000,
  })
  @Expose()
  unitPrice: number;

  @ApiProperty({
    description: "Total price for this item",
    example: 50000,
  })
  @Expose()
  totalPrice: number;
}

// This DTO is used for creating orders
export class CreateOrderItemDto {
  @ApiProperty({
    description: "Product variant",
    type: () => ({ id: String }),
  })
  @IsObject()
  @IsNotEmpty()
  productVariant: { id: string };

  @ApiProperty({
    description: "Quantity of items",
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
