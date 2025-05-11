import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderStatus } from "../entities/order-status.enum";
import { Order } from "../entities/order.entity";
import { Repository } from "typeorm";
import { OrderGateway } from "../gateways/order.gateway";
import { plainToInstance } from "class-transformer";
import { OrderDto } from "../dto/order.dto";

@Injectable()
export class OrderStatusService {
  private readonly logger = new Logger(OrderStatusService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderGateway: OrderGateway,
  ) {}

  /**
   * Update an order's status and notify connected clients via WebSockets
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    // Find the order
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "orderItems",
        "orderPromotions",
        "paymentTransactions",
        "user",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.orderStatus as OrderStatus, status);

    // Update the order status
    order.orderStatus = status;
    await this.orderRepository.save(order);

    this.logger.log(`Updated order ${id} status to ${status}`);

    // Notify clients through WebSockets
    const orderDto = plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });

    // Broadcast to all clients interested in this order
    this.orderGateway.notifyOrderStatusUpdate(orderDto);

    // Notify the specific user who owns this order
    this.orderGateway.notifyUserOrderUpdate(order.userId, orderDto);

    return order;
  }

  /**
   * Validate if the status transition is allowed
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    // Define valid status transitions
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
        OrderStatus.REFUND_REQUESTED,
      ],
      [OrderStatus.PROCESSING]: [
        OrderStatus.READY_TO_SHIP,
        OrderStatus.REFUND_REQUESTED,
      ],
      [OrderStatus.READY_TO_SHIP]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [
        OrderStatus.DELIVERED,
        OrderStatus.REFUND_REQUESTED,
      ],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUND_REQUESTED],
      [OrderStatus.REFUND_REQUESTED]: [
        OrderStatus.REFUNDED,
        OrderStatus.PARTIALLY_REFUNDED,
      ],
      // Once cancelled, refunded or partially refunded, no further transitions
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.PARTIALLY_REFUNDED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
