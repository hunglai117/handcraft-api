import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ProductVariantDto } from "../../products/dto/product-variant.dto";

export class OrderItemDto {
  @ApiProperty({
    description: "Order item unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Order this item belongs to",
    example: "9876543210987654321",
  })
  @Expose()
  orderId: string;

  @ApiProperty({
    description: "Product variant details",
    type: ProductVariantDto,
  })
  @Expose()
  @Type(() => ProductVariantDto)
  productVariant: ProductVariantDto;

  @ApiProperty({
    description: "Quantity ordered",
    example: 2,
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: "Unit price at time of order",
    example: 299900,
  })
  @Expose()
  unitPrice: number;

  @ApiProperty({
    description: "Total price for this item (quantity × unitPrice)",
    example: 599800,
  })
  @Expose()
  totalPrice: number;

  @ApiProperty({
    description: "Created timestamp",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last updated timestamp",
  })
  @Expose()
  updatedAt: Date;
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
