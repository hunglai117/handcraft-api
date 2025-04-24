import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PaginatedResponseDto } from "../../shared/dtos/paginated-response.dto";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { PaginationHelper } from "../../shared/helpers/pagination.helper";
import { UserRole } from "../../users/entities/user.entity";
import { OrderDto } from "../dto/order.dto";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentStatus } from "../entities/payment-status.enum";
import { OrdersService } from "../services/orders.service";
import { Request } from "express";
import { PaginatedOrderResponseDto } from "../dto/order-query.dto";
import { CurrentUser } from "src/modules/auth/decorators/user.decorator";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Place a new order" })
  @ApiResponse({
    status: 201,
    description: "Order placed successfully",
    type: OrderDto,
  })
  async placeOrder(
    @Req() req: Request,
    @Body() placeOrderDto: PlaceOrderDto,
  ): Promise<OrderDto> {
    const userId = req.user["id"];
    const order = await this.ordersService.placeOrder(userId, placeOrderDto);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({ summary: "Get all orders for current user" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of orders",
    type: PaginatedResponseDto,
  })
  async getUserOrders(
    @CurrentUser() req: Request,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedOrderResponseDto> {
    const userId = req.user["id"];
    const [orders, total] = await this.ordersService.findAllForUser(
      userId,
      paginationQuery.page,
      paginationQuery.limit,
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

  @Get(":id")
  @ApiOperation({ summary: "Get order details" })
  @ApiResponse({
    status: 200,
    description: "Returns order details",
    type: OrderDto,
  })
  async getOrder(
    @Req() req: Request,
    @Param("id") id: string,
  ): Promise<OrderDto> {
    const userId = req.user["id"];
    const order = await this.ordersService.findOne(id, userId);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel an order" })
  @ApiResponse({
    status: 200,
    description: "Order cancelled successfully",
    type: OrderDto,
  })
  async cancelOrder(
    @Req() req: Request,
    @Param("id") id: string,
  ): Promise<OrderDto> {
    const userId = req.user["id"];
    const order = await this.ordersService.cancelOrder(id, userId);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }

  @Put(":id/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update order status (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Order status updated",
    type: OrderDto,
  })
  async updateOrderStatus(
    @Param("id") id: string,
    @Body("status") status: OrderStatus,
  ): Promise<OrderDto> {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException(`Invalid order status: ${status}`);
    }

    const order = await this.ordersService.updateOrderStatus(id, status);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }

  @Put(":id/payment")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update payment status (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Payment status updated",
    type: OrderDto,
  })
  async updatePaymentStatus(
    @Param("id") id: string,
    @Body("status") status: PaymentStatus,
  ): Promise<OrderDto> {
    if (!Object.values(PaymentStatus).includes(status)) {
      throw new BadRequestException(`Invalid payment status: ${status}`);
    }

    const order = await this.ordersService.updatePaymentStatus(id, status);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }
}
