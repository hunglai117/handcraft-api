import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProductOptionDto {
  @ApiProperty({
    description: "Option ID",
    example: "1234567890123456789",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: "Option name (e.g., Size, Color)",
    example: "Size",
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Expose()
  name?: string;
}
