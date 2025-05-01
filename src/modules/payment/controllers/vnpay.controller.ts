/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../../auth/decorators/public.decorator";
import { VnpayWrapperService } from "../services/vnpay-wrapper.service";

@ApiTags("Payment-Vnpay")
@Controller("payment/vnpay")
@Public()
export class VnpayController {
  constructor(private readonly vnpayWrapperService: VnpayWrapperService) {}

  @Get("ipn")
  @ApiOperation({ summary: "Handle VNPay IPN (Instant Payment Notification)" })
  @ApiResponse({
    status: 200,
    description: "VNPay IPN response",
  })
  async handleIpn(@Query() query: any) {
    return this.vnpayWrapperService.verifyIpnCall(query);
  }

  @Get("return")
  @ApiOperation({ summary: "Handle VNPay return URL" })
  @ApiResponse({
    status: 200,
    description: "VNPay return URL response",
  })
  async handleReturn(@Query() query: any) {
    return this.vnpayWrapperService.verifyReturnUrl(query);
  }
}
