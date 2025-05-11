import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Comment, CommentStatus } from "../../comments/entities/comment.entity";
import { Order } from "../../order/entities/order.entity";
import { Product } from "../../products/entities/product.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getDashboardStatistics() {
    // Get counts
    const [totalUsers, totalProducts, totalOrders, pendingComments] =
      await Promise.all([
        this.userRepository.count(),
        this.productRepository.count(),
        this.orderRepository.count(),
        this.commentRepository.count({
          where: { status: CommentStatus.PENDING },
        }),
      ]);

    // Get revenue data
    const orders = await this.orderRepository.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    // Get recent registration data
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const newUsers = await this.userRepository.count({
      where: {
        createdAt: Between(lastMonth, new Date()),
      },
    });

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingComments,
      newUsers,
    };
  }

  async getRecentOrders(limit = 10) {
    return this.orderRepository.find({
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["user", "orderItems", "orderItems.product"],
    });
  }

  async getSalesAnalytics() {
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

  async getTopSellingProducts(limit = 5) {
    return this.productRepository
      .createQueryBuilder("product")
      .leftJoin("order_items", "item", "item.product_id = product.id")
      .select("product.id", "id")
      .addSelect("product.name", "name")
      .addSelect("SUM(item.quantity)", "totalSold")
      .addSelect("SUM(item.price * item.quantity)", "totalRevenue")
      .groupBy("product.id")
      .orderBy("totalSold", "DESC")
      .limit(limit)
      .getRawMany();
  }

  async getUserGrowth() {
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
