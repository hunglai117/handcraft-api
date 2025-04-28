import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, FindManyOptions, Repository } from "typeorm";
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
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    await this.usersService.findById(userId);

    const orderId = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
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
        await transactionalEntityManager.save(order);

        // Process order items
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;

        for (const itemDto of createOrderDto.orderItems) {
          // Find variant by ID
          const productVariant = await transactionalEntityManager.findOne(
            ProductVariant,
            {
              where: { id: itemDto.productVariant.id },
            },
          );

          if (!productVariant) {
            throw new NotFoundException(
              `Product variant with ID ${itemDto.productVariant.id} not found`,
            );
          }

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
          productVariant.stockQuantity =
            productVariant.stockQuantity - itemDto.quantity;
          await transactionalEntityManager.save(productVariant);
        }

        // Save order items
        await transactionalEntityManager.save(orderItems);

        // Update order with total amount
        order.totalAmount = totalAmount;
        await transactionalEntityManager.save(order);

        return order.id;
      },
    );

    // Return complete order with items
    return this.findOne(orderId);
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

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Restore product stock
      for (const item of order.orderItems) {
        const variant = await transactionalEntityManager.findOne(
          ProductVariant,
          {
            where: { id: item.productVariantId },
          },
        );

        if (!variant) {
          throw new NotFoundException(
            `Product variant with ID ${item.productVariantId} not found`,
          );
        }

        // Restore inventory
        variant.stockQuantity += item.quantity;
        await transactionalEntityManager.save(variant);
      }

      // Update order status
      order.orderStatus = OrderStatus.CANCELLED;
      await transactionalEntityManager.save(order);
    });

    return this.findOne(order.id);
  }
}
