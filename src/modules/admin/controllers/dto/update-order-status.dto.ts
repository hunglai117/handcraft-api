import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../../../order/entities/order-status.enum";

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: "New status for the order",
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: "Admin notes about the status change",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
