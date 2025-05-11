import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../../order/entities/order.entity";
import { OrderStatus } from "../../order/entities/order-status.enum";
import { OrderService } from "../../order/services/order.service";

@Injectable()
export class AdminOrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderService: OrderService,
  ) {}

  async findAll(status?: OrderStatus, page = 1, limit = 10) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("order.user", "user")
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("order.createdAt", "DESC");

    if (status) {
      queryBuilder.where("order.orderStatus = :status", { status });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "user", "promotions"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, notes?: string) {
    const order = await this.getOrderById(id);

    // Update order status
    order.orderStatus = status;
    if (notes) {
      order.notes = notes;
    }

    return this.orderRepository.save(order);
  }

  async getDailyOrderStatistics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("DATE(order.createdAt)", "date")
      .addSelect("COUNT(order.id)", "count")
      .addSelect("SUM(order.totalAmount)", "revenue")
      .where("order.createdAt >= :thirtyDaysAgo", { thirtyDaysAgo })
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();

    return result;
  }

  async getMonthlyOrderStatistics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("DATE_TRUNC('month', order.createdAt)", "month")
      .addSelect("COUNT(order.id)", "count")
      .addSelect("SUM(order.totalAmount)", "revenue")
      .where("order.createdAt >= :sixMonthsAgo", { sixMonthsAgo })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    return result;
  }
}
