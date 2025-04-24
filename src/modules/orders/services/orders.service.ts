import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { OrderPromotion } from "../entities/order-promotion.entity";
import { PaymentTransaction } from "../entities/payment-transaction.entity";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { CartService } from "./cart.service";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentStatus } from "../entities/payment-status.enum";
import { Cart } from "../entities/cart.entity";
import { v4 as uuidv4 } from "uuid";
import { ProductVariant } from "../../products/entities/product-variant.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderPromotion)
    private orderPromotionRepository: Repository<OrderPromotion>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private cartService: CartService,
    private dataSource: DataSource,
  ) {}

  /**
   * Find all orders for a user with pagination
   */
  async findAllForUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<[Order[], number]> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
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

  /**
   * Find a specific order
   */
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

    // If userId is provided, also filter by userId for security
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
   * Place a new order from the user's cart
   */
  async placeOrder(
    userId: string,
    placeOrderDto: PlaceOrderDto,
  ): Promise<Order> {
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

      // 3. Create the new order
      const order = this.orderRepository.create({
        userId,
        orderStatus: OrderStatus.PENDING,
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
        // In a real app, you would validate the promotion code, calculate the discount, etc.
        console.log(`Applying promotion code: ${placeOrderDto.promotion.code}`);
        // If promotion is valid, create order promotion record and update total amount
      }

      // 6. Create payment transaction record
      await this.createPaymentTransaction(queryRunner, order, placeOrderDto);

      // 7. Clear the cart after successful order placement
      await this.cartService.clearCart(userId);

      // 8. Commit transaction
      await queryRunner.commitTransaction();

      // 9. Return the created order with all relations
      return this.findOne(order.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Create order items from cart items
   */
  private async createOrderItemsFromCart(
    queryRunner: any,
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
    queryRunner: any,
    order: Order,
    placeOrderDto: PlaceOrderDto,
  ): Promise<PaymentTransaction> {
    const transaction = this.paymentTransactionRepository.create({
      orderId: order.id,
      paymentMethod: placeOrderDto.paymentInfo.paymentMethod,
      amount: order.totalAmount,
      transactionId:
        placeOrderDto.paymentInfo.transactionId || `trx_${uuidv4()}`,
      paymentStatus: "pending",
    });
    transaction.generateId();
    await queryRunner.manager.save(transaction);
    return transaction;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.orderStatus = status;
    return this.orderRepository.save(order);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentStatus = status;
    return this.orderRepository.save(order);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string, userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id, userId);

      if (
        order.orderStatus === OrderStatus.SHIPPED ||
        order.orderStatus === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException(
          `Cannot cancel order in ${order.orderStatus} status`,
        );
      }

      // Update order status
      order.orderStatus = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      // Restore product stock quantities
      for (const item of order.orderItems) {
        const productVariant = await this.productVariantRepository.findOne({
          where: { id: item.productVariantId },
        });

        if (productVariant) {
          productVariant.stockQuantity += item.quantity;
          await queryRunner.manager.save(productVariant);
        }
      }

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
