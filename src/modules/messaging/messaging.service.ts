import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

export enum OrderEventType {
  ORDER_CREATED = "order.created",
  ORDER_UPDATED = "order.updated",
  ORDER_CANCELLED = "order.cancelled",
  ORDER_PAID = "order.paid",
  ORDER_SHIPPED = "order.shipped",
  ORDER_DELIVERED = "order.delivered",
  ORDER_REFUND_REQUESTED = "order.refund.requested",
  ORDER_REFUNDED = "order.refunded",
  PAYMENT_PROCESSED = "payment.processed",
  PAYMENT_FAILED = "payment.failed",
  INVENTORY_RESERVED = "inventory.reserved",
  INVENTORY_RELEASED = "inventory.released",
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject("ORDER_SERVICE") private readonly orderClient: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.orderClient.connect();
      this.logger.log("Successfully connected to RabbitMQ");
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  /**
   * Emit an event to the order exchange
   */
  async emitEvent(eventType: OrderEventType, data: any): Promise<void> {
    try {
      this.orderClient
        .emit(eventType, {
          eventType,
          data,
          timestamp: new Date().toISOString(),
        })
        .subscribe({
          error: (err) => {
            this.logger.error(
              `Error emitting event ${eventType}: ${err.message}`,
            );
          },
        });

      this.logger.debug(
        `Event ${eventType} emitted with data: ${JSON.stringify(data)}`,
      );
    } catch (error) {
      this.logger.error(`Failed to emit event ${eventType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Emit order created event
   */
  async emitOrderCreated(orderId: string, orderData: any): Promise<void> {
    return this.emitEvent(OrderEventType.ORDER_CREATED, {
      orderId,
      ...orderData,
    });
  }

  /**
   * Emit order status changed event
   */
  async emitOrderUpdated(
    orderId: string,
    status: string,
    metadata?: any,
  ): Promise<void> {
    return this.emitEvent(OrderEventType.ORDER_UPDATED, {
      orderId,
      status,
      metadata,
    });
  }

  /**
   * Emit order cancelled event
   */
  async emitOrderCancelled(orderId: string, reason?: string): Promise<void> {
    return this.emitEvent(OrderEventType.ORDER_CANCELLED, {
      orderId,
      reason,
    });
  }

  /**
   * Emit payment processed event
   */
  async emitPaymentProcessed(
    orderId: string,
    paymentId: string,
    amount: number,
  ): Promise<void> {
    return this.emitEvent(OrderEventType.PAYMENT_PROCESSED, {
      orderId,
      paymentId,
      amount,
    });
  }

  /**
   * Emit payment failed event
   */
  async emitPaymentFailed(orderId: string, reason: string): Promise<void> {
    return this.emitEvent(OrderEventType.PAYMENT_FAILED, {
      orderId,
      reason,
    });
  }

  /**
   * Emit order shipped event
   */
  async emitOrderShipped(orderId: string, trackingInfo: any): Promise<void> {
    return this.emitEvent(OrderEventType.ORDER_SHIPPED, {
      orderId,
      trackingInfo,
    });
  }

  /**
   * Emit inventory reserved event
   */
  async emitInventoryReserved(orderId: string, items: any[]): Promise<void> {
    return this.emitEvent(OrderEventType.INVENTORY_RESERVED, {
      orderId,
      items,
    });
  }

  /**
   * Emit inventory released event
   */
  async emitInventoryReleased(orderId: string, items: any[]): Promise<void> {
    return this.emitEvent(OrderEventType.INVENTORY_RELEASED, {
      orderId,
      items,
    });
  }
}
