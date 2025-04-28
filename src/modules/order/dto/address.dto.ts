import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class AddressDto {
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
    description: "State/Province",
    example: "NY",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  state: string;

  @ApiProperty({
    description: "Postal/ZIP code",
    example: "10001",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  zipCode: string;

  @ApiProperty({
    description: "Country",
    example: "USA",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  country: string;
}
