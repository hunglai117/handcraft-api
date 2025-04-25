import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderStatus } from "../entities/order-status.enum";
import { RedisService } from "../../redis/redis.service";
import { RedisLockService } from "../../redis/redis-lock.service";

@Processor("orders")
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private redisService: RedisService,
    private lockService: RedisLockService,
  ) {}

  @Process("process-order")
  async processOrder(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing order ${orderId}`);

    // Use distributed lock to ensure only one process handles this order
    return this.lockService.withLock(`order:${orderId}`, async () => {
      try {
        // Get order from cache first, then from DB if not found
        let order = await this.redisService.getOrder<Order>(orderId);
        if (!order) {
          order = await this.orderRepository.findOne({
            where: { id: orderId },
          });
          if (!order) {
            throw new Error(`Order ${orderId} not found`);
          }
          // Cache the order for future operations
          await this.redisService.cacheOrder(orderId, order);
        }

        // Update order status to processing
        order.orderStatus = OrderStatus.PROCESSING;
        await this.orderRepository.save(order);

        // Perform stock validation, fraud checks, etc.
        await this.validateInventory(order);

        // Update cache with new status
        await this.redisService.invalidateOrder(orderId);
        await this.redisService.cacheOrder(orderId, order);

        // If all good, update status to ready to ship
        order.orderStatus = OrderStatus.READY_TO_SHIP;
        await this.orderRepository.save(order);

        this.logger.log(`Order ${orderId} processed successfully`);
        return { success: true };
      } catch (error) {
        this.logger.error(
          `Failed to process order ${orderId}: ${error.message}`,
        );

        // Mark order as on hold if there was an error
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
        });
        if (order) {
          order.orderStatus = OrderStatus.ON_HOLD;
          await this.orderRepository.save(order);
          await this.redisService.invalidateOrder(orderId);
        }

        throw error;
      }
    });
  }

  @Process("ship-order")
  async shipOrder(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Shipping order ${orderId}`);

    return this.lockService.withLock(`order:${orderId}`, async () => {
      try {
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
        });
        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }

        // Check if order is in correct state
        if (order.orderStatus !== OrderStatus.READY_TO_SHIP) {
          throw new Error(
            `Order ${orderId} is not ready to ship, current status: ${order.orderStatus}`,
          );
        }

        // Integration with shipping provider would go here
        // ...

        // Update order status
        order.orderStatus = OrderStatus.SHIPPED;
        await this.orderRepository.save(order);

        // Invalidate cache
        await this.redisService.invalidateOrder(orderId);

        this.logger.log(`Order ${orderId} shipped successfully`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to ship order ${orderId}: ${error.message}`);
        throw error;
      }
    });
  }

  @Process("notify-delivery")
  async notifyDelivery(job: Job<{ orderId: string; trackingUpdate: any }>) {
    const { orderId, trackingUpdate } = job.data;

    return this.lockService.withLock(`order:${orderId}`, async () => {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Update order status based on tracking update
      if (trackingUpdate.status === "delivered") {
        order.orderStatus = OrderStatus.DELIVERED;
        await this.orderRepository.save(order);
        await this.redisService.invalidateOrder(orderId);

        // Schedule completion after delivery window
        // In a real system, you might want to wait for return period to pass
        setTimeout(
          async () => {
            await this.completeOrder(orderId);
          },
          14 * 24 * 60 * 60 * 1000,
        ); // 14 days
      }

      return { success: true };
    });
  }

  @Process("handle-refund")
  async handleRefund(job: Job<{ orderId: string; reason: string }>) {
    const { orderId, reason: _ } = job.data;

    return this.lockService.withLock(`order:${orderId}`, async () => {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Process refund logic here
      // Integration with payment gateway for refund

      order.orderStatus = OrderStatus.REFUNDED;
      await this.orderRepository.save(order);
      await this.redisService.invalidateOrder(orderId);

      return { success: true };
    });
  }

  private async validateInventory(_order: Order): Promise<void> {
    // Implement inventory validation
    // This would typically involve checking stock levels
    // and potentially reserving inventory

    // Mock implementation - in a real system, this would check against inventory service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500); // simulate a delay for inventory check
    });
  }

  private async completeOrder(orderId: string): Promise<void> {
    return this.lockService.withLock(`order:${orderId}`, async () => {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (order && order.orderStatus === OrderStatus.DELIVERED) {
        order.orderStatus = OrderStatus.COMPLETED;
        await this.orderRepository.save(order);
        await this.redisService.invalidateOrder(orderId);
      }
    });
  }
}
