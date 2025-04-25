import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({
    description: "User full name",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  @Expose()
  fullName?: string;

  @ApiPropertyOptional({
    description: "User phone number",
    example: "+1234567890",
  })
  @IsOptional()
  @IsString()
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    description: "User address",
    example: "123 Main St",
  })
  @IsOptional()
  @IsString()
  @Expose()
  address?: string;

  @ApiPropertyOptional({
    description: "User city",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  @Expose()
  city?: string;

  @ApiPropertyOptional({
    description: "User country",
    example: "USA",
  })
  @IsOptional()
  @IsString()
  @Expose()
  country?: string;
}
