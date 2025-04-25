import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { OrderEventType } from "./messaging.service";
import { OrdersService } from "../orders/services/orders.service";
import { OrderStatus } from "../orders/entities/order-status.enum";
import { PaymentStatus } from "../orders/entities/payment-status.enum";

// Define type for event payloads
interface EventPayload<T> {
  eventType: string;
  data: T;
  timestamp: string;
}

interface OrderIdPayload {
  orderId: string;
}

interface PaymentFailedPayload extends OrderIdPayload {
  reason: string;
}

interface OrderShippedPayload extends OrderIdPayload {
  trackingInfo: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
  };
}

@Controller()
export class OrderEventsListener {
  private readonly logger = new Logger(OrderEventsListener.name);

  constructor(private readonly ordersService: OrdersService) {}

  @EventPattern(OrderEventType.ORDER_PAID)
  async handleOrderPaid(@Payload() payload: EventPayload<OrderIdPayload>) {
    this.logger.log(`Received order.paid event: ${JSON.stringify(payload)}`);
    const { orderId } = payload.data;

    try {
      await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID);
      this.logger.log(`Order ${orderId} marked as paid`);
    } catch (error) {
      this.logger.error(`Error processing order.paid event: ${error.message}`);
    }
  }

  @EventPattern(OrderEventType.PAYMENT_PROCESSED)
  async handlePaymentProcessed(
    @Payload() payload: EventPayload<OrderIdPayload>,
  ) {
    this.logger.log(
      `Received payment.processed event: ${JSON.stringify(payload)}`,
    );
    const { orderId } = payload.data;

    try {
      // Add the order to processing queue
      await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID);
      this.logger.log(`Payment for order ${orderId} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing payment.processed event: ${error.message}`,
      );
    }
  }

  @EventPattern(OrderEventType.PAYMENT_FAILED)
  async handlePaymentFailed(
    @Payload() payload: EventPayload<PaymentFailedPayload>,
  ) {
    this.logger.log(
      `Received payment.failed event: ${JSON.stringify(payload)}`,
    );
    const { orderId, reason } = payload.data;

    try {
      await this.ordersService.updatePaymentStatus(
        orderId,
        PaymentStatus.FAILED,
      );
      this.logger.log(`Payment for order ${orderId} failed: ${reason}`);
    } catch (error) {
      this.logger.error(
        `Error processing payment.failed event: ${error.message}`,
      );
    }
  }

  @EventPattern(OrderEventType.INVENTORY_RESERVED)
  async handleInventoryReserved(
    @Payload() payload: EventPayload<OrderIdPayload>,
  ) {
    this.logger.log(
      `Received inventory.reserved event: ${JSON.stringify(payload)}`,
    );
    const { orderId } = payload.data;

    try {
      // Once inventory is reserved, order can move to next phase
      await this.ordersService.updateOrderStatus(
        orderId,
        OrderStatus.PROCESSING,
      );
      this.logger.log(`Inventory reserved for order ${orderId}`);
    } catch (error) {
      this.logger.error(
        `Error processing inventory.reserved event: ${error.message}`,
      );
    }
  }

  @EventPattern(OrderEventType.ORDER_SHIPPED)
  async handleOrderShipped(
    @Payload() payload: EventPayload<OrderShippedPayload>,
  ) {
    this.logger.log(`Received order.shipped event: ${JSON.stringify(payload)}`);
    const { orderId, trackingInfo } = payload.data;

    try {
      await this.ordersService.updateOrderStatus(orderId, OrderStatus.SHIPPED);
      this.logger.log(
        `Order ${orderId} marked as shipped with tracking: ${JSON.stringify(trackingInfo)}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing order.shipped event: ${error.message}`,
      );
    }
  }

  @EventPattern(OrderEventType.INVENTORY_RELEASED)
  async handleInventoryReleased(
    @Payload() payload: EventPayload<OrderIdPayload>,
  ) {
    this.logger.log(
      `Received inventory.released event: ${JSON.stringify(payload)}`,
    );
    // Handle inventory released event, which might happen if an order is cancelled
    // or if inventory reservation fails
  }
}
