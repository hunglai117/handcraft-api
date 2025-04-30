import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, QueryRunner, Repository } from "typeorm";
import { OrderItem } from "../entities/order-item.entity";
import { Order } from "../entities/order.entity";
// import { OrderPromotion } from "../entities/order-promotion.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { plainToInstance } from "class-transformer";
import { CartItem } from "src/modules/cart/entities/cart-item.entity";
import { PaymentTransaction } from "src/modules/payment/entities/payment-transaction.entity";
import { PaymentStatus } from "src/modules/payment/enums/payment-status.enum";
import { Cart } from "../../cart/entities/cart.entity";
import { CartService } from "../../cart/services/cart.service";
import { PaymentMethod } from "../../payment/enums/payment-method.enum";
import { VnpayWrapperService } from "../../payment/services/vnpay-wrapper.service";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { RedisLockService } from "../../redis/redis-lock.service";
import { RedisService } from "../../redis/redis.service";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { PaginationHelper } from "../../shared/helpers/pagination.helper";
import { PaginatedOrderResponseDto } from "../dto/order-query.dto";
import { PaymentInfoDto } from "../dto/payment-info.dto";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { OrderStatus } from "../entities/order-status.enum";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    // @InjectRepository(OrderPromotion)
    // private orderPromotionRepository: Repository<OrderPromotion>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private cartService: CartService,
    private dataSource: DataSource,
    @InjectQueue("orders") private ordersQueue: Queue,
    private redisService: RedisService,
    private lockService: RedisLockService,
    private vnpayWrapperService: VnpayWrapperService,
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

  async placeOrder(
    userId: string,
    placeOrderDto: PlaceOrderDto,
    ipAddr?: string,
  ) {
    return this.lockService.withLock(
      `user:${userId}:order-creation`,
      async () => {
        let paymentUrl: string;
        const selectedCartItemIds = placeOrderDto.items;
        const cartItems = await this.cartService.getCartItemsByIds(
          userId,
          selectedCartItemIds,
        );

        if (cartItems.length === 0) {
          throw new BadRequestException(
            "None of the selected items were found in your cart",
          );
        }

        const { subtotal } =
          this.cartService.calculateCartItemTotals(cartItems);

        this.logger.log(
          `Creating order for user ${userId} with ${cartItems.length} selected items`,
        );

        const order = await this.dataSource.transaction(async (manager) => {
          let order = this.orderRepository.create({
            userId,
            totalAmount: subtotal,
            orderStatus: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            shippingInfo: placeOrderDto.shippingInfo,
            notes: placeOrderDto.notes,
          });
          order.generateId();

          const orderItems = await this.createOrderItemsFromSelectedCart(
            manager,
            cartItems,
            order,
          );
          order.orderItems = orderItems;

          const transaction = await this.createPaymentTransaction(
            order,
            placeOrderDto.paymentInfo,
          );

          // Generate payment URL if needed
          if (
            placeOrderDto.paymentInfo.paymentMethod === PaymentMethod.VNPAY &&
            ipAddr
          ) {
            paymentUrl = await this.vnpayWrapperService.createPaymentUrl(
              transaction,
              ipAddr,
            );
          }

          if (!order.paymentTransactions) {
            order.paymentTransactions = [];
          }

          order.paymentTransactions.push(transaction);

          await manager.save(order);

          return order;
        });

        await this.cartService.removeManyCartItemsWithLock(
          userId,
          selectedCartItemIds,
        );

        await this.cartService.persistCartToDatabase(userId);

        await this.redisService.cacheOrder(order.id, order);

        return {
          ...order,
          ...(paymentUrl ? { paymentUrl } : {}),
        };
      },
    );
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    return this.lockService.withLock(`order:${id}:cancel`, async () => {
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

        // Use transaction to handle order cancellation
        await this.dataSource.transaction(async (manager) => {
          // Update order status
          order.orderStatus = OrderStatus.CANCELLED;
          await manager.save(order);

          // Restore product stock quantities
          for (const item of order.orderItems) {
            const productVariant = await this.productVariantRepository.findOne({
              where: { id: item.productVariantId },
            });

            if (productVariant) {
              productVariant.stockQuantity += item.quantity;
              await manager.save(productVariant);
            }
          }
        });

        // Invalidate cache
        await this.redisService.invalidateOrder(id);

        return order;
      } catch (error) {
        this.logger.error(
          `Error cancelling order ${id}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    });
  }

  private async handleCancelledOrder(order: Order): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Restore product stock quantities
        for (const item of order.orderItems) {
          const productVariant = await this.productVariantRepository.findOne({
            where: { id: item.productVariantId },
          });

          if (productVariant) {
            productVariant.stockQuantity += item.quantity;
            await manager.save(productVariant);
          }
        }
      });
    } catch (error) {
      this.logger.error(
        `Error handling cancelled order ${order.id}: ${error.message}`,
        error.stack,
      );
      throw error;
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

  private async createOrderItemsFromSelectedCart(
    manager: EntityManager,
    cartItems: CartItem[],
    order: Order,
  ): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const productVariant = await manager.findOne(ProductVariant, {
        where: { id: cartItem.productVariantId },
        lock: {
          mode: "pessimistic_write",
        },
      });

      if (!productVariant) {
        throw new NotFoundException(`Product variant not found`);
      }

      if (productVariant.stockQuantity < cartItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${productVariant.title}. Only ${productVariant.stockQuantity} available.`,
        );
      }

      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productVariantId: cartItem.productVariantId,
        quantity: cartItem.quantity,
        unitPrice: productVariant.price,
        totalPrice: productVariant.price * cartItem.quantity,
      });
      orderItem.generateId();

      orderItems.push(orderItem);

      productVariant.stockQuantity -= cartItem.quantity;
      await manager.save(productVariant);
    }

    return orderItems;
  }

  private async createPaymentTransaction(
    order: Order,
    paymentInfo: PaymentInfoDto,
  ): Promise<PaymentTransaction> {
    const transaction = this.paymentTransactionRepository.create({
      orderId: order.id,
      paymentMethod: paymentInfo.paymentMethod,
      amount: order.totalAmount,
      paymentStatus: PaymentStatus.PENDING,
    });
    transaction.generateId();

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

  // /**
  //  * Update order payment status and record payment transaction details
  //  *
  //  * @param orderId - The ID of the order to update
  //  * @param paymentStatus - The new payment status
  //  * @param paymentDetails - Additional payment details from the payment provider
  //  * @returns Updated order
  //  */
  // async updateOrderPaymentStatus(
  //   orderId: string,
  //   paymentStatus: PaymentStatus,
  //   paymentDetails?: Record<string, any>,
  // ): Promise<Order> {
  //   return this.lockService.withLock(`order:${orderId}:payment`, async () => {
  //     try {
  //       const order = await this.findOne(orderId);

  //       if (!order) {
  //         throw new NotFoundException(`Order with ID ${orderId} not found`);
  //       }

  //       // Update order payment status
  //       order.paymentStatus = paymentStatus;

  //       // If payment is completed, update order status to processing
  //       if (paymentStatus === PaymentStatus.COMPLETED) {
  //         if (order.orderStatus === OrderStatus.PENDING) {
  //           order.orderStatus = OrderStatus.PROCESSING;
  //         }
  //       }

  //       await this.dataSource.transaction(async (manager) => {
  //         // Create a new payment transaction record
  //         const transaction = new PaymentTransaction();
  //         transaction.orderId = order.id;
  //         transaction.amount = order.totalAmount;
  //         transaction.paymentStatus = paymentStatus;

  //         // Use the payment method from the first transaction if there is one
  //         if (
  //           order.paymentTransactions &&
  //           order.paymentTransactions.length > 0
  //         ) {
  //           transaction.paymentMethod =
  //             order.paymentTransactions[0].paymentMethod;
  //         } else {
  //           transaction.paymentMethod = "vnpay"; // Default to vnpay if no previous transaction
  //         }

  //         // Set transaction ID if provided
  //         if (paymentDetails?.transactionId) {
  //           transaction.transactionId = paymentDetails.transactionId;
  //         }

  //         // Store additional payment details in metadata
  //         if (paymentDetails) {
  //           transaction.metadata = paymentDetails;
  //         }

  //         transaction.generateId();
  //         await manager.save(transaction);

  //         // Initialize payment transactions array if not yet initialized
  //         if (!order.paymentTransactions) {
  //           order.paymentTransactions = [];
  //         }

  //         // Add this transaction to the order's payment transactions
  //         order.paymentTransactions.push(transaction);

  //         // Save the updated order
  //         await manager.save(order);
  //       });

  //       // Invalidate cache
  //       await this.redisService.invalidateOrder(orderId);

  //       // If payment is completed, add to processing queue
  //       if (paymentStatus === PaymentStatus.COMPLETED) {
  //         await this.addOrderToProcessingQueue(orderId);
  //       }

  //       this.logger.log(
  //         `Payment status for order ${orderId} updated to ${paymentStatus}`,
  //       );

  //       return order;
  //     } catch (error) {
  //       this.logger.error(
  //         `Error updating payment status for order ${orderId}: ${error.message}`,
  //         error.stack,
  //       );
  //       throw error;
  //     }
  //   });
  // }
}
