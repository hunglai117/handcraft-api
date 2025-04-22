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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if user exists
    await this.usersService.findById(userId);

    // Create order
    const order = this.orderRepository.create({
      userId,
      paymentMethod: createOrderDto.paymentMethod,
      shippingAddress: createOrderDto.shippingAddress,
      shippingCity: createOrderDto.shippingCity,
      shippingState: createOrderDto.shippingState,
      shippingZip: createOrderDto.shippingZip,
      shippingCountry: createOrderDto.shippingCountry,
      notes: createOrderDto.notes,
      totalAmount: 0, // Will be calculated below
    });

    if (!order.id) {
      order.generateId();
    }

    // Save order first to get ID
    await this.orderRepository.save(order);

    // Process order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const itemDto of createOrderDto.orderItems) {
      const product = await this.productsService.findOne(itemDto.productId);

      // Check stock availability
      if (product.stockQuantity < itemDto.quantity) {
        throw new BadRequestException(
          `Not enough stock for product ${product.name}. Available: ${product.stockQuantity}`,
        );
      }

      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productId: product.id,
        quantity: itemDto.quantity,
        unitPrice: product.price,
        productName: product.name,
        productNotes: itemDto.notes,
      });

      if (!orderItem.id) {
        orderItem.generateId();
      }

      orderItems.push(orderItem);
      totalAmount += product.price * itemDto.quantity;

      // Update product stock
      // Using only properties that exist in UpdateProductDto
      await this.productsService.update(product.id, {
        stockQuantity: product.stockQuantity - itemDto.quantity,
      });

      // Update purchase count separately via direct DB access if needed
      // This would require custom implementation in ProductsService
    }

    // Save order items
    await this.orderItemRepository.save(orderItems);

    // Update order with total amount and return complete order
    order.totalAmount = totalAmount;
    order.orderItems = orderItems;
    await this.orderRepository.save(order);

    return order;
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

    Object.assign(order, updateOrderDto);

    return this.orderRepository.save(order);
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        "Cannot cancel orders that have been shipped or delivered",
      );
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.update(product.id, {
        stockQuantity: product.stockQuantity + item.quantity,
      });

      // Update purchase count separately via direct DB access if needed
      // This would require custom implementation in ProductsService
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
