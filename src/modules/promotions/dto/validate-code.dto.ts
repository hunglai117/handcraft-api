import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { PromotionDto } from "src/modules/promotions/dto/promotion.dto";

@Expose()
export class ValidateCodePromotionResponseDto extends PromotionDto {
  @ApiProperty({
    description: "Indicates if the promotion code is valid",
    example: true,
  })
  valid: boolean;

  @ApiPropertyOptional({
    description: "Promotion object if the code is valid",
    type: PromotionDto,
  })
  @Type(() => PromotionDto)
  promotion?: PromotionDto;

  @ApiPropertyOptional({
    description: "Message indicating the reason for validation failure",
    example: "Promotion code is expired",
  })
  message?: string;
}
