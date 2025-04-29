import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";
import { PaymentMethod } from "src/modules/payment/enums/payment-method.enum";

export class PaymentInfoDto {
  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.VNPAY,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  @Expose()
  paymentMethod: PaymentMethod;
}
