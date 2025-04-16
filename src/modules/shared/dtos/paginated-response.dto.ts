import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: "Array of items",
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: "Total number of items",
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: "Whether there is a next page",
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: "Whether there is a previous page",
    example: false,
  })
  hasPrevPage: boolean;
}
