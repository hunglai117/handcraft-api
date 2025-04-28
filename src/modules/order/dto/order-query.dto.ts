import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { OrderDto } from "./order.dto";
import { PaginatedResponseDto } from "src/modules/shared/dtos/paginated-response.dto";

export class PaginatedOrderResponseDto extends PaginatedResponseDto<OrderDto> {
  @ApiProperty({
    description: "Array of order items",
    type: [OrderDto],
  })
  @Expose()
  @Type(() => OrderDto)
  items: OrderDto[];
}
