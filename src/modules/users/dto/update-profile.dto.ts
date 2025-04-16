import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({
    description: "User first name",
    example: "John",
  })
  @IsOptional()
  @IsString()
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({
    description: "User last name",
    example: "Doe",
  })
  @IsOptional()
  @IsString()
  @Expose()
  lastName?: string;

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
    description: "User state/province",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  @Expose()
  state?: string;

  @ApiPropertyOptional({
    description: "User zip/postal code",
    example: "10001",
  })
  @IsOptional()
  @IsString()
  @Expose()
  zip?: string;

  @ApiPropertyOptional({
    description: "User country",
    example: "USA",
  })
  @IsOptional()
  @IsString()
  @Expose()
  country?: string;
}
