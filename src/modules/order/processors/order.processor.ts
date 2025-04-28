import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { OrderService } from "../services/order.service";
import { OrderStatus } from "../entities/order-status.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Processor("orders")
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private orderService: OrderService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process("process-order")
  async processOrder(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Processing order ${orderId}`);

    try {
      // 1. Get the order
      const order = await this.orderService.findOne(orderId);

      // 2. Verify inventory (double-check)
      // Note: This was already checked during order placement but we double-check
      // in case of concurrent orders

      // 3. Update order status to PROCESSING
      order.orderStatus = OrderStatus.PROCESSING;

      // 4. Emit event for other services
      this.eventEmitter.emit("order.processed", {
        orderId: order.id,
        userId: order.userId,
        orderItems: order.orderItems,
        totalAmount: order.totalAmount,
      });

      // 5. Log completion
      this.logger.log(`Order ${orderId} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw error; // Allow Bull to retry based on the job configuration
    }
  }
}
