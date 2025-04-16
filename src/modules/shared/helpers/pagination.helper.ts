import { PaginatedResponseDto } from "../dtos/paginated-response.dto";
import { PaginationQueryDto } from "../dtos/pagination.dto";

export class PaginationHelper {
  static createPaginatedResponse<T>(
    items: T[],
    totalItems: number,
    paginationOptions: PaginationQueryDto,
  ): PaginatedResponseDto<T> {
    const { page, limit } = paginationOptions;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
