import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { UserRole } from "../entities/user.entity";

export class UserDto {
  @Expose()
  @ApiProperty({
    description: "User unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  fullName: string;

  @Expose()
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: "User role",
    example: "user",
    enum: UserRole,
  })
  role: UserRole;

  @Expose()
  @ApiProperty({
    description: "User phone number",
    example: "+1234567890",
    nullable: true,
  })
  phone?: string;

  @Expose()
  @ApiProperty({
    description: "User address",
    example: "123 Main St",
    nullable: true,
  })
  address?: string;

  @Expose()
  @ApiProperty({
    description: "User city",
    example: "New York",
    nullable: true,
  })
  city?: string;

  @Expose()
  @ApiProperty({
    description: "User country",
    example: "USA",
    nullable: true,
  })
  country?: string;

  @Expose()
  @ApiProperty({
    description: "User creation timestamp",
    example: "2023-05-15T14:30:00Z",
  })
  createdAt?: Date;

  @Expose()
  @ApiProperty({
    description: "User last update timestamp",
    example: "2023-05-15T14:30:00Z",
  })
  updatedAt?: Date;
}
