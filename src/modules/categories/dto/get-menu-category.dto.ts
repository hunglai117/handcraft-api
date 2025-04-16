import { ApiProperty } from "@nestjs/swagger";
import { CategoryDto } from "./category.dto";
import { Expose, Type } from "class-transformer";

export class GetMenuCategoryResponseDto {
  @ApiProperty({
    description: "List of categories",
    type: [CategoryDto],
  })
  @Expose()
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}
