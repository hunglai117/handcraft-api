import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: "Array of items",
    isArray: true,
  })
  @Expose()
  items: T[];

  @ApiProperty({
    description: "Total number of items",
    example: 42,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    description: "Whether there is a next page",
    example: true,
  })
  @Expose()
  hasNextPage: boolean;

  @ApiProperty({
    description: "Whether there is a previous page",
    example: false,
  })
  @Expose()
  hasPrevPage: boolean;
}
