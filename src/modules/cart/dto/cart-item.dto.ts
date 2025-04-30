import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { ProductVariantDto } from "../../products/dto/product-variant.dto";

export class CartItemProductVariantDto extends ProductVariantDto {
  @ApiProperty({
    description: "Product name",
    example: "Blue Bowl",
  })
  @Expose()
  @Transform(({ obj }) => obj.product.name)
  productName: string;
}

export class CartItemDto {
  @ApiProperty({
    description: "Cart item unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Cart this item belongs to",
    example: "9876543210987654321",
  })
  @Expose()
  cartId: string;

  @ApiProperty({
    description: "Product variant details",
    type: CartItemProductVariantDto,
  })
  @Expose()
  @Type(() => CartItemProductVariantDto)
  productVariant: CartItemProductVariantDto;

  @ApiProperty({
    description: "Quantity of this item in the cart",
    example: 2,
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: "Price for this item (quantity × unit price)",
    example: 599800,
  })
  @Expose()
  price: number;

  @ApiProperty({
    description: "Creation timestamp",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
  })
  @Expose()
  updatedAt: Date;
}
