import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class UpdateCartItemDto {
  @ApiProperty({
    description: "New quantity for the cart item",
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Expose()
  quantity: number;
}
