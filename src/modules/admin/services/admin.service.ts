import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Product } from "../../products/entities/product.entity";
import { Order } from "../../order/entities/order.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getDashboardStatistics() {
    const totalUsers = await this.userRepository.count();
    const totalProducts = await this.productRepository.count();
    const totalOrders = await this.orderRepository.count();

    // Calculate total revenue
    const orders = await this.orderRepository.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount.toString()),
      0,
    );

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    };
  }

  async getRecentOrders() {
    return this.orderRepository.find({
      take: 10,
      order: { createdAt: "DESC" },
      relations: ["user", "orderItems"],
    });
  }

  async getSalesAnalytics() {
    // Get orders grouped by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await this.orderRepository
      .createQueryBuilder("order")
      .select("DATE(order.createdAt)", "date")
      .addSelect("SUM(order.totalAmount)", "revenue")
      .addSelect("COUNT(order.id)", "count")
      .where("order.createdAt >= :thirtyDaysAgo", { thirtyDaysAgo })
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();

    return orders;
  }

  async getTopSellingProducts() {
    // Query to get top selling products based on order items
    return this.productRepository
      .createQueryBuilder("product")
      .leftJoin("order_items", "item", "item.productId = product.id")
      .select("product.id", "id")
      .addSelect("product.name", "name")
      .addSelect("SUM(item.quantity)", "totalSold")
      .addSelect("SUM(item.price * item.quantity)", "totalRevenue")
      .groupBy("product.id")
      .orderBy("totalSold", "DESC")
      .limit(10)
      .getRawMany();
  }

  async getUserGrowth() {
    // Get user signups grouped by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await this.userRepository
      .createQueryBuilder("user")
      .select("DATE_TRUNC('month', user.createdAt)", "month")
      .addSelect("COUNT(user.id)", "count")
      .where("user.createdAt >= :sixMonthsAgo", { sixMonthsAgo })
      .groupBy("month")
      .orderBy("month", "ASC")
      .getRawMany();

    return userGrowth;
  }
}
