import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { ProviderType } from "../../users/entities/user-provider.entity";

export class SocialAuthRequestDto {
  @ApiProperty({
    description: "Authentication token received from social provider",
    example: "ya29.a0AfB_byBmToEnZnH6IKt5Z4WoSc7DmJ8oBTg...",
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  token: string;

  @ApiProperty({
    description: "Authentication provider type",
    enum: ProviderType,
    example: ProviderType.GOOGLE,
  })
  @IsNotEmpty()
  @IsEnum(ProviderType)
  @Expose()
  provider: ProviderType;

  @ApiProperty({
    description: "Optional refresh token from provider",
    example: "1//04dB2zMMI1DpACgYIARAAGAQSNwF-L9...",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Expose()
  refreshToken?: string;
}
