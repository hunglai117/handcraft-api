import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../entities/order-status.enum";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateOrderStatusRequestDto {
  @ApiProperty({
    description: "New status of the order",
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsString()
  @IsNotEmpty()
  @Expose()
  status: OrderStatus;
}
