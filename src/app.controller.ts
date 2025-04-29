import { Controller, Get, Redirect } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Forward")
@Controller()
export class ForwardController {
  @Get("/vnpay-ipn")
  @Redirect("/api/payment/vnpay/ipn")
  vnpayIpn() {}

  @Get("/vnpay-return")
  @Redirect("/api/payment/vnpay/return")
  vnpayReturn() {}
}
