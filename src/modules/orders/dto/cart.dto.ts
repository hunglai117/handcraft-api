import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CartItemDto } from "./cart-item.dto";

export class CartDto {
  @ApiProperty({
    description: "Cart unique identifier",
    example: "1234567890123456789",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "User who owns this cart",
    example: "9876543210987654321",
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: "Items in the cart",
    type: [CartItemDto],
  })
  @Expose()
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];

  @ApiProperty({
    description: "Total number of items in the cart",
    example: 5,
  })
  @Expose()
  totalItems: number;

  @ApiProperty({
    description: "Subtotal price of all items in the cart",
    example: 150000,
  })
  @Expose()
  subtotal: number;

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
