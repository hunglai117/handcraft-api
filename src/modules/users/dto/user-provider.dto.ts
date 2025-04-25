import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ProviderType } from "../entities/user-provider.entity";

export class UserProviderDto {
  @Expose()
  @ApiProperty({
    description: "Provider unique identifier",
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: "Provider type",
    enum: ProviderType,
    example: ProviderType.GOOGLE,
  })
  provider: ProviderType;

  @Expose()
  @ApiProperty({
    description: "Provider-specific ID for this user",
    example: "12345678901234567890",
  })
  providerId: string;

  @Expose()
  @ApiProperty({
    description: "Provider connection creation date",
    example: "2023-05-15T14:30:00Z",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "Provider connection last update date",
    example: "2023-05-15T14:30:00Z",
  })
  updatedAt: Date;
}
