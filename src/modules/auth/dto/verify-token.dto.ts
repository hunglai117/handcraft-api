import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class VerifyTokenDto {
  @ApiProperty({
    description: "JWT token to verify",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @Expose()
  token: string;
}

export class VerifyTokenResponseDto {
  @ApiProperty({
    description: "Indicates if the token is valid",
    example: true,
  })
  @Expose()
  valid: boolean;

  @ApiProperty({
    description: "User ID associated with the token (if valid)",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false,
  })
  @Expose()
  userId?: string;

  @ApiProperty({
    description: "Email associated with the token (if valid)",
    example: "user@example.com",
    required: false,
  })
  @Expose()
  email?: string;

  @ApiProperty({
    description: "User's full name (if valid)",
    example: "John Doe",
    required: false,
  })
  @Expose()
  fullName?: string;

  @ApiProperty({
    description: "Expiration time of the token in Unix timestamp (if valid)",
    example: 1714631436,
    required: false,
  })
  @Expose()
  exp?: number;

  @ApiProperty({
    description:
      "Message providing additional context about verification result",
    example: "Token is valid",
    required: false,
  })
  @Expose()
  message?: string;
}
