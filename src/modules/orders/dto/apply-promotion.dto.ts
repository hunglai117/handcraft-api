import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class ApplyPromotionDto {
  @ApiProperty({
    description: "Promotion code to apply to the order",
    example: "SPRING25",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  code: string;
}
