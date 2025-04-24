import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateProductOptionDto {
  @ApiProperty({
    description: "Option name (e.g., Size, Color)",
    example: "Size",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  name: string;
}
