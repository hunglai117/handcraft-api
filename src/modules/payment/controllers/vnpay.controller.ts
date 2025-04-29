import { Controller, Get, Logger, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ReturnQueryFromVNPay,
} from "vnpay";
import { Public } from "../../auth/decorators/public.decorator";
import { OrderStatus } from "../../order/entities/order-status.enum";
import { OrderService } from "../../order/services/order.service";
import { PaymentStatus } from "../enums/payment-status.enum";
import { VnpayWrapperService } from "../services/vnpay-wrapper.service";

@ApiTags("Payment-Vnpay")
@Controller("payment/vnpay")
export class VnpayController {
  private readonly logger = new Logger(VnpayController.name);

  constructor(
    private readonly vnpayWrapperService: VnpayWrapperService,
    private readonly orderService: OrderService,
  ) {}

  @Public()
  @Get("ipn")
  @ApiOperation({ summary: "Handle VNPay IPN (Instant Payment Notification)" })
  @ApiResponse({
    status: 200,
    description: "VNPay IPN response",
  })
  async handleIpn(@Query() query: ReturnQueryFromVNPay) {
    try {
      // Verify the IPN request from VNPay
      const verify = await this.vnpayWrapperService.verifyIpnCall(query);

      if (!verify.isVerified) {
        this.logger.warn(
          `IPN verification failed: checksum invalid for order ${query.vnp_TxnRef}`,
        );
        return IpnFailChecksum;
      }

      if (!verify.isSuccess) {
        this.logger.warn(
          `IPN verification failed: transaction unsuccessful for order ${query.vnp_TxnRef}`,
        );
        return IpnUnknownError;
      }

      // Find the order in the database
      try {
        const foundOrder = await this.orderService.findOne(verify.vnp_TxnRef);

        // If order not found or order ID doesn't match
        if (!foundOrder) {
          this.logger.warn(
            `IPN verification failed: order not found ${verify.vnp_TxnRef}`,
          );
          return IpnOrderNotFound;
        }

        // If the payment amount doesn't match
        // Note: VNPay amount is in VND with last 2 digits representing decimal points
        // Convert amounts to numbers for comparison
        const orderAmount = Number(foundOrder.totalAmount) * 100; // Convert to VNPay format (no decimal point)
        const vnpayAmount = Number(verify.vnp_Amount);

        if (orderAmount !== vnpayAmount) {
          this.logger.warn(
            `IPN verification failed: amount mismatch for order ${verify.vnp_TxnRef}. ` +
              `Expected: ${orderAmount}, Received: ${vnpayAmount}`,
          );
          return IpnInvalidAmount;
        }

        // If order has already been confirmed/completed
        if (
          foundOrder.paymentStatus === PaymentStatus.COMPLETED ||
          foundOrder.orderStatus === OrderStatus.COMPLETED
        ) {
          this.logger.warn(
            `IPN verification failed: order already confirmed ${verify.vnp_TxnRef}`,
          );
          return InpOrderAlreadyConfirmed;
        }

        // Update order status
        // await this.orderService.updateOrderPaymentStatus(
        //   foundOrder.id,
        //   PaymentStatus.COMPLETED,
        //   {
        //     transactionId: verify.vnp_TransactionNo,
        //     bankCode: verify.vnp_BankCode,
        //     cardType: verify.vnp_CardType,
        //     payDate: verify.vnp_PayDate,
        //     responseCode: verify.vnp_ResponseCode,
        //   },
        // );

        this.logger.log(
          `IPN verification successful: order ${verify.vnp_TxnRef} payment completed`,
        );
        return IpnSuccess;
      } catch (error) {
        this.logger.error(
          `Error finding or updating order: ${error.message}`,
          error.stack,
        );
        return IpnUnknownError;
      }
    } catch (error) {
      this.logger.error(
        `IPN verification error: ${error.message}`,
        error.stack,
      );
      return IpnUnknownError;
    }
  }
}
