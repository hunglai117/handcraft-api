import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category name",
    example: "Home Decor",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: "Parent category ID",
    nullable: true,
  })
  @IsOptional()
  @Expose()
  parentId?: string;
}
