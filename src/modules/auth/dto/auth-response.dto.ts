import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../users/entities/user.entity";

export class UserResponseDto {
  @ApiProperty({
    description: "User ID",
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
    description: "User email",
    example: "user@example.com",
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.USER,
  })
  @Expose()
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({
    description: "User information",
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @Expose()
  token: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: "User information",
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @Expose()
  token: string;
}
