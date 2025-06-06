import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ToBoolean } from "src/common/decorators/dto";
import { PromotionDto } from "src/modules/promotions/dto/promotion.dto";

export class ValidateCodePromotionResponseDto extends PromotionDto {
  @ApiProperty({
    description: "Indicates if the promotion code is valid",
    example: true,
  })
  @Expose()
  @ToBoolean()
  valid: boolean;

  @ApiPropertyOptional({
    description: "Promotion object if the code is valid",
    type: PromotionDto,
  })
  @Expose()
  @Type(() => PromotionDto)
  promotion?: PromotionDto;

  @ApiPropertyOptional({
    description: "Message indicating the reason for validation failure",
    example: "Promotion code is expired",
  })
  @Expose()
  message?: string;
}
