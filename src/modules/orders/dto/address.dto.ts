import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddressDto {
  @ApiProperty({
    description: "Full name of the recipient",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  fullName: string;

  @ApiProperty({
    description: "Street address (line 1)",
    example: "123 Main Street",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  addressLine1: string;

  @ApiProperty({
    description: "Street address (line 2)",
    example: "Apartment 4B",
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  addressLine2?: string;

  @ApiProperty({
    description: "City",
    example: "Hanoi",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  city: string;

  @ApiProperty({
    description: "State/Province",
    example: "Ha Noi",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  state: string;

  @ApiProperty({
    description: "Postal/ZIP code",
    example: "10000",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  postalCode: string;

  @ApiProperty({
    description: "Country",
    example: "Vietnam",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  country: string;

  @ApiProperty({
    description: "Phone number",
    example: "+84 123 456 789",
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @ApiProperty({
    description: "Email address",
    example: "john.doe@example.com",
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  email?: string;
}
