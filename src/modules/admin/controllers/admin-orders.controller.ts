import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";

import { UpdateOrderStatusDto } from "../dto/update-order-status.dto";
import { OrderStatus } from "../../order/entities/order-status.enum";
import { AdminOrderService } from "../services/admin-order.service";

@ApiTags("admin/orders")
@Controller("admin/orders")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Get("statistics/daily")
  @ApiOperation({ summary: "Get daily order statistics" })
  @ApiResponse({
    status: 200,
    description: "Return daily order statistics",
  })
  getDailyStatistics() {
    return this.adminOrderService.getDailyOrderStatistics();
  }

  @Get("statistics/monthly")
  @ApiOperation({ summary: "Get monthly order statistics" })
  @ApiResponse({
    status: 200,
    description: "Return monthly order statistics",
  })
  getMonthlyStatistics() {
    return this.adminOrderService.getMonthlyOrderStatistics();
  }

  @Get()
  @ApiOperation({ summary: "Get all orders with pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number, default is 1",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page, default is 10",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: OrderStatus,
    description: "Filter by order status",
  })
  @ApiResponse({
    status: 200,
    description: "Return all orders",
  })
  findAll(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("status") status?: OrderStatus,
  ) {
    return this.adminOrderService.findAll(status, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order details by ID" })
  @ApiParam({
    name: "id",
    description: "Order ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Return the order details" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async findOne(@Param("id") id: string) {
    return this.adminOrderService.getOrderById(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update order status" })
  @ApiParam({
    name: "id",
    description: "Order ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminOrderService.updateStatus(
      id,
      updateOrderStatusDto.orderStatus,
      updateOrderStatusDto.statusNote,
    );
  }
}
