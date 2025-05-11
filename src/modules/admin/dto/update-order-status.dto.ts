import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../../order/entities/order-status.enum";

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: "The new status of the order",
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  orderStatus: OrderStatus;

  @ApiProperty({
    description: "Optional note about the status change",
    example: "Order processed and ready for shipping",
    required: false,
  })
  @IsOptional()
  @IsString()
  statusNote?: string;
}
