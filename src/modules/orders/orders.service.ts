import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ProductsService } from "../products/products.service";
import { UsersService } from "../users/users.service";
import { OrderStatus } from "./entities/order-status.enum";
import { PaymentStatus } from "./entities/payment-status.enum";
import { ProductVariant } from "../products/entities/product-variant.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if user exists
    await this.usersService.findById(userId);

    // Create order
    const order = new Order();
    order.userId = userId;
    // Store shipping info in the shippingAddress object
    order.shippingAddress = {
      address: createOrderDto.shippingAddress,
      city: createOrderDto.shippingCity,
      state: createOrderDto.shippingState,
      zipCode: createOrderDto.shippingZip,
      country: createOrderDto.shippingCountry,
    };
    // Store additional info in billingAddress to keep track of notes
    order.billingAddress = {
      notes: createOrderDto.notes,
    };
    order.totalAmount = 0; // Will be calculated below
    order.orderStatus = OrderStatus.PENDING;
    order.paymentStatus = PaymentStatus.UNPAID;

    if (!order.id) {
      order.generateId();
    }

    // Save order first to get ID
    await this.orderRepository.save(order);

    // Process order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const itemDto of createOrderDto.orderItems) {
      // Find variant by ID
      const productVariant = await this.findProductVariant(
        itemDto.productVariantId,
      );

      // Check stock availability
      if (productVariant.stockQuantity < itemDto.quantity) {
        throw new BadRequestException(
          `Not enough stock for variant ${productVariant.title}. Available: ${productVariant.stockQuantity}`,
        );
      }

      // Create order item
      const orderItem = new OrderItem();
      orderItem.orderId = order.id;
      orderItem.productVariantId = productVariant.id;
      orderItem.quantity = itemDto.quantity;
      orderItem.unitPrice = productVariant.price;
      orderItem.totalPrice = productVariant.price * itemDto.quantity;

      if (!orderItem.id) {
        orderItem.generateId();
      }

      orderItems.push(orderItem);
      totalAmount += productVariant.price * itemDto.quantity;

      // Update product variant stock
      await this.updateProductVariantStock(
        productVariant,
        productVariant.stockQuantity - itemDto.quantity,
      );
    }

    // Save order items
    await this.orderItemRepository.save(orderItems);

    // Update order with total amount and return complete order
    order.totalAmount = totalAmount;
    order.orderItems = orderItems;
    await this.orderRepository.save(order);

    return order;
  }

  // Helper method to find a product variant by ID
  private async findProductVariant(variantId: string): Promise<ProductVariant> {
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException(
        `Product variant with ID ${variantId} not found`,
      );
    }

    return variant;
  }

  // Helper method to update product variant stock
  private async updateProductVariantStock(
    variant: ProductVariant,
    newStock: number,
  ): Promise<ProductVariant> {
    variant.stockQuantity = newStock;
    return this.productVariantRepository.save(variant);
  }

  async findAll(userId?: string): Promise<Order[]> {
    const queryOptions: FindManyOptions<Order> = {
      relations: ["orderItems"],
      order: {
        createdAt: "DESC",
      },
    };

    if (userId) {
      queryOptions.where = { userId };
    }

    return this.orderRepository.find(queryOptions);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["orderItems"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.findAll(userId);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Handle updates to orderStatus if provided
    if (updateOrderDto.status) {
      order.orderStatus = updateOrderDto.status;
    }

    // Update shipping address if any shipping fields are provided
    if (
      updateOrderDto.shippingAddress ||
      updateOrderDto.shippingCity ||
      updateOrderDto.shippingState ||
      updateOrderDto.shippingZip ||
      updateOrderDto.shippingCountry
    ) {
      order.shippingAddress = {
        ...order.shippingAddress, // Preserve existing values
        address:
          updateOrderDto.shippingAddress || order.shippingAddress?.address,
        city: updateOrderDto.shippingCity || order.shippingAddress?.city,
        state: updateOrderDto.shippingState || order.shippingAddress?.state,
        zipCode: updateOrderDto.shippingZip || order.shippingAddress?.zipCode,
        country:
          updateOrderDto.shippingCountry || order.shippingAddress?.country,
      };
    }

    // Update notes if provided
    if (updateOrderDto.notes) {
      order.billingAddress = {
        ...order.billingAddress, // Preserve existing values
        notes: updateOrderDto.notes,
      };
    }

    return this.orderRepository.save(order);
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (
      order.orderStatus !== OrderStatus.PENDING &&
      order.orderStatus !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        "Cannot cancel orders that have been shipped or delivered",
      );
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const variant = await this.findProductVariant(item.productVariantId);
      await this.updateProductVariantStock(
        variant,
        variant.stockQuantity + item.quantity,
      );
    }

    order.orderStatus = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
