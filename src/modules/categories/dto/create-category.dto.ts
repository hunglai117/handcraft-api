import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

@Expose()
export class CreateCategoryDto {
  @ApiProperty({
    description: "Category name",
    example: "Home Decor",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: "Parent category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
