import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VnpayService } from "nestjs-vnpay";
import {
  ProductCode,
  VnpLocale,
  VerifyReturnUrl,
  ReturnQueryFromVNPay,
} from "vnpay";
import { PaymentTransaction } from "../entities/payment-transaction.entity";

@Injectable()
export class VnpayWrapperService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentUrl(transaction: PaymentTransaction, ipAddr: string) {
    const orderId = transaction.orderId;
    const amount = transaction.amount;
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = ProductCode.Other;
    const locale = VnpLocale.VN;
    const bankCode = "";

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: transaction.id,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Locale: locale,
      vnp_ReturnUrl: this.configService.get("vnpay.returnUrl"),
      ...(bankCode ? { vnp_BankCode: bankCode } : {}),
    });

    return paymentUrl;
  }

  async verifyIpnCall(params: ReturnQueryFromVNPay): Promise<VerifyReturnUrl> {
    return this.vnpayService.verifyIpnCall(params);
  }

  async verifyReturnUrl(
    params: ReturnQueryFromVNPay,
  ): Promise<VerifyReturnUrl> {
    return this.vnpayService.verifyReturnUrl(params);
  }
}
