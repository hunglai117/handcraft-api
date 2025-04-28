import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentTransaction } from "../entities/payment-transaction.entity";
import { OrderService } from "../../order/services/order.service";
import { ProcessPaymentDto } from "../dto/process-payment.dto";
import { v4 as uuidv4 } from "uuid";
import { PaymentMethod } from "../enums/payment-method.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private orderService: OrderService,
  ) {}

  async processPayment(
    orderId: string,
    paymentDto: ProcessPaymentDto,
  ): Promise<PaymentTransaction> {
    // Get the order to verify it exists and to get total amount
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Create a payment transaction record
    const transaction = new PaymentTransaction();
    transaction.orderId = order.id;
    transaction.transactionId = paymentDto.transactionId || uuidv4();
    transaction.paymentMethod = paymentDto.method;
    transaction.amount = order.totalAmount;
    transaction.paymentStatus = PaymentStatus.PROCESSING;
    transaction.generateId();

    // Save the initial transaction record
    await this.paymentTransactionRepository.save(transaction);

    try {
      // Process the payment through the appropriate provider
      await this.processPaymentWithProvider(paymentDto, order);

      // Mark transaction as completed
      transaction.paymentStatus = PaymentStatus.COMPLETED;
      await this.paymentTransactionRepository.save(transaction);

      // Update order payment status
      await this.orderService.processPayment(orderId, {
        provider: paymentDto.method,
        transactionId: transaction.transactionId,
        amount: order.totalAmount,
        metadata: paymentDto.metadata,
      });

      return transaction;
    } catch (error) {
      // Handle payment failure
      transaction.paymentStatus = PaymentStatus.FAILED;
      await this.paymentTransactionRepository.save(transaction);

      this.logger.error(
        `Payment failed for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async processPaymentWithProvider(
    paymentDto: ProcessPaymentDto,
    order: any,
  ): Promise<void> {
    // This would be replaced with actual payment provider integrations
    switch (paymentDto.method) {
      case PaymentMethod.CREDIT_CARD:
        await this.processCreditCardPayment(paymentDto);
        break;
      case PaymentMethod.PAYPAL:
        await this.processPaypalPayment(paymentDto);
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentDto.method}`);
    }
  }

  private async processCreditCardPayment(
    paymentDto: ProcessPaymentDto,
  ): Promise<void> {
    // Simulated credit card processing
    this.logger.log("Processing credit card payment");

    // In a real implementation, this would integrate with a payment gateway
    if (!paymentDto.cardDetails) {
      throw new Error("Card details are required for credit card payments");
    }

    // Simulate a small delay to mimic payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate success/failure based on test card numbers
    if (paymentDto.cardDetails.number === "4111111111111111") {
      return; // Success
    } else {
      throw new Error("Payment failed: Invalid card");
    }
  }

  private async processPaypalPayment(
    paymentDto: ProcessPaymentDto,
  ): Promise<void> {
    // Simulated PayPal processing
    this.logger.log("Processing PayPal payment");

    // In a real implementation, this would use the PayPal SDK
    if (!paymentDto.paypalDetails) {
      throw new Error("PayPal details are required for PayPal payments");
    }

    // Simulate a small delay to mimic payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate success (in a real app, we would validate the PayPal response)
    return;
  }

  async getTransactionsByOrderId(
    orderId: string,
  ): Promise<PaymentTransaction[]> {
    return this.paymentTransactionRepository.find({
      where: { orderId },
      order: { createdAt: "DESC" },
    });
  }

  async getTransaction(transactionId: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    return transaction;
  }
}
