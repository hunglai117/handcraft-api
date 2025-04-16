import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

export class GetCategoryQueryParamDto {
  @ApiPropertyOptional({
    description: "If true, include all children of categories children",
    example: true,
  })
  @IsOptional()
  @Expose()
  includeChildren?: boolean = true;

  @ApiPropertyOptional({
    description: "If true, include all parents of categories parents",
    example: true,
  })
  @IsOptional()
  @Expose()
  includeParents?: boolean = true;
}
