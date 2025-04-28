import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VnpayService } from "nestjs-vnpay";
import { Order } from "src/modules/order/entities/order.entity";
import { Request } from "express";
import { ProductCode, VnpLocale } from "vnpay";

@Injectable()
export class VnpayWrapperService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentUrl(order: Order, req: Request) {
    const ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1"; // Fallback IP

    const orderId = order.id; // Example Order ID as requested
    const amount = order.totalAmount; // Example amount (in VND)
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = ProductCode.Other;
    const locale = VnpLocale.VN;
    const bankCode = ""; // Optional: Leave empty for VNPay gateway selection, or specify bank code (e.g., 'NCB')

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr.toString(), // Ensure IP is a string
      vnp_TxnRef: orderId, // Use your unique order ID
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Locale: locale,
      vnp_ReturnUrl: this.configService.get("vnpay.returnUrl"),
      // vnp_TmnCode is automatically picked from module config
      ...(bankCode ? { vnp_BankCode: bankCode } : {}), // Conditionally add bankCode if provided
      // Add other VNPay parameters as needed, e.g., vnp_CreateDate
      // vnp_ExpireDate can be calculated if needed
    });

    // Return the URL for the controller to handle the redirect
    return paymentUrl;
  }
}
