import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateUserRequestDto {
  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  fullName: string;

  @ApiProperty({
    description: "User email address (must be unique)",
    example: "user@example.com",
  })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    description: "User password",
    example: "123456",
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Expose()
  password: string;

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

export class CreateUserResponseDto {
  @ApiProperty({
    description: "Unique identifier for the user",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @Expose()
  email: string;

  @ApiPropertyOptional({
    description: "User phone number",
    example: "+1234567890",
  })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    description: "User address",
    example: "123 Main St",
  })
  @Expose()
  address?: string;

  @ApiPropertyOptional({
    description: "User city",
    example: "New York",
  })
  @Expose()
  city?: string;

  @ApiPropertyOptional({
    description: "User country",
    example: "USA",
  })
  @Expose()
  country?: string;

  @ApiProperty({
    description: "Date when the user was created",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Date when the user was last updated",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  updatedAt: Date;
}
