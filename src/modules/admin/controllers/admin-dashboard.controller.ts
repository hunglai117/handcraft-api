import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { AdminDashboardService } from "../services/admin-dashboard.service";

@ApiTags("admin/dashboard")
@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get("statistics")
  @ApiOperation({
    summary: "Get dashboard statistics (total users, orders, products, etc.)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns statistics for the admin dashboard",
  })
  async getDashboardStatistics() {
    return this.adminDashboardService.getDashboardStatistics();
  }

  @Get("recent-orders")
  @ApiOperation({ summary: "Get recent orders for the dashboard" })
  @ApiResponse({
    status: 200,
    description: "Returns recent orders",
  })
  async getRecentOrders() {
    return this.adminDashboardService.getRecentOrders();
  }

  @Get("sales-analytics")
  @ApiOperation({ summary: "Get sales analytics for the dashboard" })
  @ApiResponse({
    status: 200,
    description: "Returns sales analytics data",
  })
  async getSalesAnalytics() {
    return this.adminDashboardService.getSalesAnalytics();
  }

  @Get("top-selling-products")
  @ApiOperation({ summary: "Get top selling products" })
  @ApiResponse({
    status: 200,
    description: "Returns top selling products data",
  })
  async getTopSellingProducts() {
    return this.adminDashboardService.getTopSellingProducts();
  }

  @Get("user-growth")
  @ApiOperation({ summary: "Get user growth data" })
  @ApiResponse({
    status: 200,
    description: "Returns user growth analytics data",
  })
  async getUserGrowth() {
    return this.adminDashboardService.getUserGrowth();
  }
}
