import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CartItemInputDto {
  @ApiProperty({
    description: "Product ID to add to cart",
    example: "1234567890123456789",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  productId: string;

  @ApiProperty({
    description: "Quantity to add",
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Expose()
  quantity: number = 1;
}

export class AddMultipleToCartDto {
  @ApiProperty({
    description: "Array of items to add to cart",
    type: [CartItemInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  @Expose()
  items: CartItemInputDto[];
}
