import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class InfoDto {
  @ApiProperty({
    description: "Phone number",
    example: "123-456-7890",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @ApiProperty({
    description: "Street address",
    example: "123 Main St, Apt 4B",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  address: string;

  @ApiProperty({
    description: "City",
    example: "New York",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  city: string;

  @ApiProperty({
    description: "Country",
    example: "USA",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  country: string;
}
