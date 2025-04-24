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
import { UserRole } from "../../users/entities/user.entity";
import { OrderDto } from "../dto/order.dto";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentStatus } from "../entities/payment-status.enum";
import { OrdersService } from "../services/orders.service";

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
    @Req() req,
    @Body() placeOrderDto: PlaceOrderDto,
  ): Promise<OrderDto> {
    const userId = req.user.id;
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
    @Req() req,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ): Promise<PaginatedResponseDto<OrderDto>> {
    const userId = req.user.id;
    const [orders, total] = await this.ordersService.findAllForUser(
      userId,
      page,
      limit,
    );

    const orderDtos = orders.map((order) =>
      plainToInstance(OrderDto, order, { excludeExtraneousValues: true }),
    );

    return {
      data: orderDtos,
      meta: {
        page: +page,
        limit: +limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order details" })
  @ApiResponse({
    status: 200,
    description: "Returns order details",
    type: OrderDto,
  })
  async getOrder(@Req() req, @Param("id") id: string): Promise<OrderDto> {
    const userId = req.user.id;
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
  async cancelOrder(@Req() req, @Param("id") id: string): Promise<OrderDto> {
    const userId = req.user.id;
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
