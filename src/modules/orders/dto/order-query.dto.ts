import { PaginatedResponseDto } from "src/modules/shared/dtos/paginated-response.dto";
import { OrderDto } from "./order.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class PaginatedOrderResponseDto extends PaginatedResponseDto<OrderDto> {
  @ApiProperty({
    description: "Array of order items",
    type: [OrderDto],
  })
  @Type(() => OrderDto)
  @Expose()
  items: OrderDto[];
}
