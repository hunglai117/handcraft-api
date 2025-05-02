import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { OrderItem } from "../entities/order-item.entity";
import { Order } from "../entities/order.entity";
import { OrderPromotion } from "../entities/order-promotion.entity";
import { plainToInstance } from "class-transformer";
import { CartItem } from "src/modules/cart/entities/cart-item.entity";
import { PaymentTransaction } from "src/modules/payment/entities/payment-transaction.entity";
import { PaymentStatus } from "src/modules/payment/enums/payment-status.enum";
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
import { PromotionsService } from "../../promotions/promotions.service";
import { Promotion } from "../../promotions/entities/promotion.entity";
import { PromotionType } from "../../promotions/entities/promotion.entity";

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
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private cartService: CartService,
    private dataSource: DataSource,
    private redisService: RedisService,
    private lockService: RedisLockService,
    private vnpayWrapperService: VnpayWrapperService,
    private promotionsService: PromotionsService,
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

          // Apply promotion if provided
          if (placeOrderDto.promotion?.code) {
            try {
              const promotionCode = placeOrderDto.promotion.code;
              this.logger.log(
                `Applying promotion code ${promotionCode} to order`,
              );

              const orderPromotion = await this.applyPromotion(
                manager,
                order,
                promotionCode,
              );

              if (orderPromotion) {
                if (!order.orderPromotions) {
                  order.orderPromotions = [];
                }
                order.orderPromotions.push(orderPromotion);
                this.logger.log(
                  `Applied promotion ${promotionCode} with discount ${orderPromotion.discountAmount}`,
                );
              }
            } catch (error) {
              this.logger.error(`Failed to apply promotion: ${error.message}`);
              throw error;
            }
          }

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

        return {
          ...order,
          ...(paymentUrl ? { paymentUrl } : {}),
        };
      },
    );
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

      productVariant.stockQuantity -= cartItem.quantity;
      productVariant.purchaseCount += cartItem.quantity;

      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productVariantId: cartItem.productVariantId,
        quantity: cartItem.quantity,
        unitPrice: productVariant.price,
        totalPrice: productVariant.price * cartItem.quantity,
      });
      orderItem.generateId();

      orderItems.push(orderItem);

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

  async cancelOrder(id: string, userId: string): Promise<Order> {
    return this.lockService.withLock(`order:${id}:cancel`, async () => {
      try {
        const order = await this.findOne(id, userId);

        if (
          [OrderStatus.SHIPPED, OrderStatus.COMPLETED].includes(
            order.orderStatus as OrderStatus,
          )
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

  /**
   * Calculate the discount amount based on promotion type
   */
  private calculatePromotionDiscount(
    promotion: Promotion,
    orderAmount: number,
  ): number {
    switch (promotion.type) {
      case PromotionType.PERCENTAGE_DISCOUNT:
        // Calculate percentage discount (e.g. 20% of order total)
        return (orderAmount * Number(promotion.discountValue)) / 100;

      case PromotionType.FIXED_AMOUNT_DISCOUNT:
        // Fixed amount discount (e.g. $50 off)
        // Make sure the discount doesn't exceed the order amount
        return Math.min(Number(promotion.discountValue), orderAmount);

      case PromotionType.FREE_SHIPPING:
        // For simplicity, assume a flat shipping rate discount
        // This could be replaced with actual shipping calculation
        return 0; // Shipping cost would be handled separately

      default:
        return 0;
    }
  }

  /**
   * Apply a promotion to an order and create the OrderPromotion record
   */
  private async applyPromotion(
    manager: EntityManager,
    order: Order,
    promotionCode: string,
  ): Promise<OrderPromotion | null> {
    try {
      // Validate the promotion
      const validationResult =
        await this.promotionsService.validatePromoCode(promotionCode);

      if (!validationResult.valid || !validationResult.promotion) {
        throw new BadRequestException(
          validationResult.message || "Invalid promotion code",
        );
      }

      const promotion = validationResult.promotion;

      // Check minimum order amount if specified
      if (
        promotion.minimumOrderAmount &&
        order.totalAmount < Number(promotion.minimumOrderAmount)
      ) {
        throw new BadRequestException(
          `This promotion requires a minimum order amount of ${promotion.minimumOrderAmount}`,
        );
      }

      // Calculate the discount
      const discountAmount = this.calculatePromotionDiscount(
        promotion,
        order.totalAmount,
      );

      if (discountAmount <= 0) {
        return null;
      }

      // Create the order promotion record
      const orderPromotion = this.orderPromotionRepository.create({
        orderId: order.id,
        promotionId: promotion.id,
        discountAmount,
      });
      orderPromotion.generateId();

      // Save the order promotion
      await manager.save(orderPromotion);

      // Apply the discount to the order total
      order.totalAmount = Math.max(0, order.totalAmount - discountAmount);
      await manager.save(order);

      // Increment the usage count of the promotion
      promotion.usageCount = (promotion.usageCount || 0) + 1;
      await manager.save(promotion);

      return orderPromotion;
    } catch (error) {
      this.logger.error(
        `Error applying promotion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
