import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { CurrentUser } from "src/modules/auth/decorators/user.decorator";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { User, UserRole } from "src/modules/users/entities/user.entity";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { PaginationQueryDto } from "../../shared/dtos/pagination.dto";
import { PaginatedOrderResponseDto } from "../dto/order-query.dto";
import { OrderDto } from "../dto/order.dto";
import { PlaceOrderDto } from "../dto/place-order.dto";
import { OrderService } from "../services/order.service";
import { UpdateOrderStatusRequestDto } from "../dto/update-order-status.dto";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: "Place a new order" })
  @ApiResponse({
    status: 201,
    description: "Order placed successfully",
    type: OrderDto,
  })
  async placeOrder(
    @CurrentUser("id") userId: string,
    @Body() placeOrderDto: PlaceOrderDto,
  ): Promise<OrderDto> {
    const order = await this.orderService.placeOrder(userId, placeOrderDto);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({ summary: "Get all orders (admin) or current user orders" })
  @ApiResponse({
    status: 200,
    description: "Return all orders based on role and user.",
    type: PaginatedOrderResponseDto,
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedOrderResponseDto> {
    const orders =
      user.role === UserRole.ADMIN
        ? await this.orderService.findAll(paginationQuery)
        : await this.orderService.findAll(paginationQuery, user.id);

    return plainToInstance(PaginatedOrderResponseDto, orders, {
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
    @CurrentUser() user: User,
    @Param("id") id: string,
  ): Promise<OrderDto> {
    const order = await this.orderService.findOne(id);

    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new NotFoundException(`Order not found`);
    }

    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel an order" })
  @ApiResponse({
    status: 200,
    description: "Order cancelled successfully",
    type: OrderDto,
  })
  async cancelOrder(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ): Promise<OrderDto> {
    const order = await this.orderService.cancelOrder(id, userId);
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
    @Body() body: UpdateOrderStatusRequestDto,
  ): Promise<OrderDto> {
    const order = await this.orderService.updateOrderStatus(id, body.status);
    return plainToInstance(OrderDto, order, { excludeExtraneousValues: true });
  }
}
