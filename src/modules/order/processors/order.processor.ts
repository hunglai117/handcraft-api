import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { OrderStatus } from "../entities/order-status.enum";
import { EOrderJob } from "../order.enum";
import { OrderProcessService } from "../services/order-process.service";

@Processor("orders")
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private orderProcessService: OrderProcessService) {}

  @Process(EOrderJob.UPDATE_COMPLETE_STATUS)
  async updateCompletePaymentStatus(
    job: Job<{
      orderId: string;
      paymentDetails: Record<string, any>;
    }>,
  ): Promise<void> {
    this.logger.log(
      `Updating payment status for order ${job.data.orderId} to ${OrderStatus.PAID}`,
    );

    await this.orderProcessService.handleUpdateCompletePayment(job.data);
  }
}
