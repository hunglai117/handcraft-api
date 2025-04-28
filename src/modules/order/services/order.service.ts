import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { OrderPromotion } from "../entities/order-promotion.entity";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { CartService } from "../../cart/services/cart.service";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentStatus } from "../entities/payment-status.enum";
import { Cart } from "../../cart/entities/cart.entity";
import { v4 as uuidv4 } from "uuid";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { RedisService } from "../../redis/redis.service";
import { RedisLockService } from "../../redis/redis-lock.service";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { PaginationHelper } from "../../shared/helpers/pagination.helper";
import { plainToInstance } from "class-transformer";
import { PaginatedOrderResponseDto } from "../dto/order-query.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderPromotion)
    private orderPromotionRepository: Repository<OrderPromotion>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private cartService: CartService,
    private dataSource: DataSource,
    @InjectQueue("orders") private ordersQueue: Queue,
    private redisService: RedisService,
    private lockService: RedisLockService,
  ) {}

  async findAllForUser(
    page = 1,
    limit = 10,
    userId?: string,
  ): Promise<[Order[], number]> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        ...(userId ? { userId } : {}),
      },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
      relations: [
        "orderItems",
        "orderItems.productVariant",
        "orderItems.productVariant.product",
        "orderPromotions",
        "orderPromotions.promotion",
        "paymentTransactions",
      ],
    });

    return [orders, total];
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    userId?: string,
  ): Promise<PaginatedOrderResponseDto> {
    const [orders, total] = await this.findAllForUser(
      paginationQuery.page,
      paginationQuery.limit,
      userId,
    );

    const resp = PaginationHelper.createPaginatedResponse(
      orders,
      total,
      paginationQuery,
    );

    return plainToInstance(PaginatedOrderResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string, userId?: string): Promise<Order> {
    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.productVariant", "productVariant")
      .leftJoinAndSelect("productVariant.product", "product")
      .leftJoinAndSelect("order.orderPromotions", "orderPromotions")
      .leftJoinAndSelect("orderPromotions.promotion", "promotion")
      .leftJoinAndSelect("order.paymentTransactions", "paymentTransactions")
      .where("order.id = :id", { id });

    if (userId) {
      query.andWhere("order.userId = :userId", { userId });
    }

    const order = await query.getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Place a new order from the user's cart - enhanced with distributed locking and queuing
   */
  async placeOrder(
    userId: string,
    placeOrderDto: PlaceOrderDto,
  ): Promise<Order> {
    return this.lockService.withLock(
      `user:${userId}:order-creation`,
      async () => {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // 1. Get the user's cart
          const cart = await this.cartService.getOrCreateCart(userId);

          if (!cart.cartItems || cart.cartItems.length === 0) {
            throw new BadRequestException(
              "Cannot place an order with an empty cart",
            );
          }

          // 2. Calculate cart totals
          const { subtotal } = await this.cartService.calculateCartTotals(cart);

          // 3. Create the new order with CREATED initial status
          const order = this.orderRepository.create({
            userId,
            orderStatus: OrderStatus.CREATED,
            totalAmount: subtotal, // Will be updated if promotions are applied
            paymentStatus: PaymentStatus.UNPAID,
            shippingAddress: placeOrderDto.shippingAddress,
            billingAddress: placeOrderDto.billingAddress,
          });
          order.generateId();
          await queryRunner.manager.save(order);

          // 4. Create order items from cart items
          await this.createOrderItemsFromCart(queryRunner, cart, order);

          // 5. Apply promotion if provided
          if (placeOrderDto.promotion) {
            // Implement promotion handling - this is a placeholder
            this.logger.log(
              `Applying promotion code: ${placeOrderDto.promotion.code}`,
            );
          }

          // 6. Create payment transaction record
          await this.createPaymentTransaction(
            queryRunner,
            order,
            placeOrderDto,
          );

          // 7. Change order status to PENDING
          order.orderStatus = OrderStatus.PENDING;
          await queryRunner.manager.save(order);

          // 8. Clear the cart after successful order placement
          await this.cartService.clearCart(userId);

          // 9. Commit transaction
          await queryRunner.commitTransaction();

          // 10. Add order to the processing queue for async handling
          await this.addOrderToProcessingQueue(order.id);

          // 11. Cache the order
          await this.redisService.cacheOrder(order.id, order);

          // 12. Return the created order with all relations
          return this.findOne(order.id);
        } catch (error) {
          // Rollback transaction on error
          await queryRunner.rollbackTransaction();
          this.logger.error(
            `Error creating order: ${error.message}`,
            error.stack,
          );
          throw error;
        } finally {
          // Release query runner
          await queryRunner.release();
        }
      },
    );
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    return this.lockService.withLock(`order:${id}:cancel`, async () => {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const order = await this.findOne(id, userId);

        if (
          [
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
          ].includes(order.orderStatus as OrderStatus)
        ) {
          throw new BadRequestException(
            `Cannot cancel order in ${order.orderStatus} status`,
          );
        }

        // Update order status
        order.orderStatus = OrderStatus.CANCELLED;
        await queryRunner.manager.save(order);

        // Handle inventory restoration
        await this.handleCancelledOrder(order, queryRunner);

        await queryRunner.commitTransaction();

        // Invalidate cache
        await this.redisService.invalidateOrder(id);

        return order;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error cancelling order ${id}: ${error.message}`,
          error.stack,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    });
  }

  /**
   * Add order to processing queue for async processing
   */
  private async addOrderToProcessingQueue(orderId: string): Promise<void> {
    try {
      await this.ordersQueue.add(
        "process-order",
        { orderId },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        },
      );
      this.logger.log(`Order ${orderId} added to processing queue`);
    } catch (error) {
      this.logger.error(
        `Failed to add order ${orderId} to queue: ${error.message}`,
        error.stack,
      );
      // Don't rethrow - we don't want to fail the order creation if queuing fails
      // Instead, we'll have a background job that checks for unprocessed orders
    }
  }

  /**
   * Handle inventory restoration for cancelled orders
   */
  private async handleCancelledOrder(
    order: Order,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const runner = queryRunner || this.dataSource.createQueryRunner();
    let localTransaction = false;

    if (!queryRunner) {
      await runner.connect();
      await runner.startTransaction();
      localTransaction = true;
    }

    try {
      // Restore product stock quantities
      for (const item of order.orderItems) {
        const productVariant = await this.productVariantRepository.findOne({
          where: { id: item.productVariantId },
        });

        if (productVariant) {
          productVariant.stockQuantity += item.quantity;
          await runner.manager.save(productVariant);
        }
      }

      if (localTransaction) {
        await runner.commitTransaction();
      }
    } catch (error) {
      if (localTransaction) {
        await runner.rollbackTransaction();
      }
      this.logger.error(
        `Error handling cancelled order ${order.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      if (localTransaction) {
        await runner.release();
      }
    }
  }

  /**
   * Create order items from cart items
   */
  private async createOrderItemsFromCart(
    queryRunner: QueryRunner,
    cart: Cart,
    order: Order,
  ): Promise<void> {
    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.cartItems) {
      const productVariant = await this.productVariantRepository.findOne({
        where: { id: cartItem.productVariantId },
      });

      if (!productVariant) {
        throw new NotFoundException(`Product variant not found`);
      }

      // Check stock availability
      if (productVariant.stockQuantity < cartItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${productVariant.title}. Only ${productVariant.stockQuantity} available.`,
        );
      }

      // Create order item
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productVariantId: cartItem.productVariantId,
        quantity: cartItem.quantity,
        unitPrice: productVariant.price,
        totalPrice: productVariant.price * cartItem.quantity,
      });
      orderItem.generateId();
      await queryRunner.manager.save(orderItem);
      orderItems.push(orderItem);

      // Update product variant stock quantity
      productVariant.stockQuantity -= cartItem.quantity;
      await queryRunner.manager.save(productVariant);
    }

    order.orderItems = orderItems;
    await queryRunner.manager.save(order);
  }

  /**
   * Create payment transaction record for the order
   */
  private async createPaymentTransaction(
    queryRunner: QueryRunner,
    order: Order,
    placeOrderDto: PlaceOrderDto,
  ): Promise<any> {
    // Note: PaymentTransaction entity reference is removed since it should be in payment module
    // Create a transaction record with minimal information
    const transaction = {
      orderId: order.id,
      paymentMethod: placeOrderDto.paymentInfo.paymentMethod,
      amount: order.totalAmount,
      transactionId:
        placeOrderDto.paymentInfo.transactionId || `trx_${uuidv4()}`,
      paymentStatus: "pending",
    };

    // In a real implementation, this would be handled by a PaymentService
    // This is just a placeholder to track the basic transaction info
    order.paymentInfo = transaction;
    await queryRunner.manager.save(order);

    return transaction;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.lockService.withLock(`order:${id}:status`, async () => {
      const order = await this.findOne(id);
      const oldStatus = order.orderStatus;
      order.orderStatus = status;

      // Save new status
      await this.orderRepository.save(order);

      // Invalidate cache
      await this.redisService.invalidateOrder(id);

      // Handle status change side effects
      if (oldStatus !== status) {
        await this.handleOrderStatusChange(order, oldStatus, status);
      }

      return order;
    });
  }

  private async handleOrderStatusChange(
    order: Order,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    // Add order to appropriate queues based on status transition
    switch (newStatus) {
      case OrderStatus.READY_TO_SHIP:
        // Notify fulfillment team
        await this.ordersQueue.add("ship-order", { orderId: order.id });
        break;

      case OrderStatus.SHIPPED:
        // Track shipment and send customer notification
        // In real implementation, you would integrate with shipping provider APIs
        break;

      case OrderStatus.CANCELLED:
        // Return inventory
        await this.handleCancelledOrder(order);
        break;

      case OrderStatus.REFUND_REQUESTED:
        // Queue refund processing
        await this.ordersQueue.add("handle-refund", {
          orderId: order.id,
          reason: "Customer requested", // In real app, you'd pass the actual reason
        });
        break;

      default:
        break;
    }
  }
}
