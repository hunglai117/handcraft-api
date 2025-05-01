/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { VnpayService } from "nestjs-vnpay";
import { OrderStatus } from "src/modules/order/entities/order-status.enum";
import { Repository } from "typeorm";
import {
  dateFormat,
  generateRandomString,
  getDateInGMT7,
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnResponse,
  IpnSuccess,
  IpnUnknownError,
  ProductCode,
  QueryDr,
  QueryDrResponse,
  ReturnQueryFromVNPay,
  VnpLocale,
} from "vnpay";
import { PaymentTransaction } from "../entities/payment-transaction.entity";
import { PaymentStatus } from "../enums/payment-status.enum";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EOrderJob } from "src/modules/order/order.enum";

@Injectable()
export class VnpayWrapperService {
  private readonly logger = new Logger(VnpayService.name);

  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectQueue("orders") private ordersQueue: Queue,
  ) {}

  async createPaymentUrl(transaction: PaymentTransaction, ipAddr: string) {
    const orderId = transaction.orderId;
    const amount = transaction.amount;
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = ProductCode.Other;
    const locale = VnpLocale.VN;
    const bankCode = "";
    const createDate = new Date();
    const expireDate = new Date(createDate.getTime() + 30 * 60 * 1000);
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: transaction.id,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Locale: locale,
      vnp_ReturnUrl: this.configService.get("vnpay.returnUrl"),
      ...(bankCode ? { vnp_BankCode: bankCode } : {}),
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
    });

    return paymentUrl;
  }

  async verifyIpnCall(query: any): Promise<IpnResponse> {
    try {
      const verify = await this.vnpayService.verifyIpnCall(query);

      if (!verify.isVerified) {
        this.logger.warn(
          `IPN verification failed: checksum invalid for tx ${query.vnp_TxnRef}`,
        );
        return IpnFailChecksum;
      }

      if (!verify.isSuccess) {
        this.logger.warn(
          `IPN verification failed: transaction unsuccessful for tx ${query.vnp_TxnRef}`,
        );
        return IpnUnknownError;
      }

      const foundPaymentTransaction =
        await this.paymentTransactionRepository.findOne({
          where: { id: verify.vnp_TxnRef },
          relations: ["order"],
        });

      if (!foundPaymentTransaction) {
        this.logger.warn(
          `IPN verification failed: payment not found ${verify.vnp_TxnRef}`,
        );
        return IpnOrderNotFound;
      }

      const paymentAmount = Number(foundPaymentTransaction.amount);
      const vnpayAmount = Number(verify.vnp_Amount);
      if (paymentAmount !== vnpayAmount) {
        this.logger.warn(
          `IPN verification failed: amount mismatch for tx ${verify.vnp_TxnRef}. ` +
            `Expected: ${paymentAmount}, Received: ${vnpayAmount}`,
        );
        return IpnInvalidAmount;
      }

      if (
        foundPaymentTransaction.order.paymentStatus ===
          PaymentStatus.COMPLETED ||
        foundPaymentTransaction.order.orderStatus === OrderStatus.PAID
      ) {
        this.logger.warn(
          `IPN verification failed: tx already confirmed ${verify.vnp_TxnRef}`,
        );
        return InpOrderAlreadyConfirmed;
      }

      await this.ordersQueue.add(EOrderJob.UPDATE_COMPLETE_STATUS, {
        orderId: foundPaymentTransaction.orderId,
        paymentDetails: {
          id: verify.vnp_TxnRef,
          transactionId: verify.vnp_TransactionNo,
          bankCode: verify.vnp_BankCode,
          cardType: verify.vnp_CardType,
          payDate: verify.vnp_PayDate,
          responseCode: verify.vnp_ResponseCode,
          bankTranNo: verify.vnp_BankTranNo,
        },
      });

      this.logger.log(
        `IPN verification successful: tx ${verify.vnp_TxnRef} payment status update queued`,
      );
      return IpnSuccess;
    } catch (error) {
      this.logger.error(
        `IPN verification error: ${error.message}`,
        error.stack,
      );
      return IpnUnknownError;
    }
  }

  async verifyReturnUrl(params: ReturnQueryFromVNPay): Promise<{
    result: boolean;
    message: string;
  }> {
    try {
      const verify = await this.vnpayService.verifyReturnUrl(params);
      if (!verify.isVerified) {
        return {
          result: false,
          message: "Xác thực tính toàn vẹn dữ liệu thất bại",
        };
      }
      if (!verify.isSuccess) {
        return {
          result: false,
          message: "Đơn hàng thanh toán thất bại",
        };
      }
      return {
        result: true,
        message: "Xác thực URL trả về thành công",
      };
    } catch (error) {
      return {
        result: false,
        message: "Dữ liệu không hợp lệ",
      };
    }
  }

  async queryTransactions() {
    const date = dateFormat(getDateInGMT7(new Date("2024/05/21")));

    const res: QueryDrResponse = await this.vnpayService.queryDr({
      vnp_RequestId: generateRandomString(16),
      vnp_IpAddr: "1.1.1.1",
      vnp_TxnRef: "1716257871703",
      vnp_TransactionNo: 14422574,
      vnp_OrderInfo: "Thanh toan don hang",
      vnp_TransactionDate: date,
      vnp_CreateDate: date,
    } as QueryDr);
    console.log("res", res);
  }
}
