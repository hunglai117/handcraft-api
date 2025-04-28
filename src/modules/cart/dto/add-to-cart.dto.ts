import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class AddToCartDto {
  @ApiProperty({
    description: "Product variant ID to add to cart",
    example: "1234567890123456789",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  productVariantId: string;

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
