import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateUserRequestDto {
  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  lastName: string;

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
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: "Unique identifier for the user",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @Expose()
  email: string;

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
