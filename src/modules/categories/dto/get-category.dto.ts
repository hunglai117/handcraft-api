import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";
import { ToBoolean } from "src/common/decorators/dto";

export { ToBoolean };

export class GetCategoryQueryParamDto {
  @ApiPropertyOptional({
    description: "If true, include all children of categories children",
    example: true,
  })
  @IsOptional()
  @Expose()
  @ToBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: "If true, include all parents of categories parents",
    example: true,
  })
  @IsOptional()
  @Expose()
  @ToBoolean()
  includeParents?: boolean;
}
