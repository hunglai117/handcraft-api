import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/user.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  NotFoundResponseDto,
  BadRequestResponseDto,
} from "../shared/shared.dto";
import { User, UserRole } from "../users/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderDto } from "./dto/order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrdersService } from "./orders.service";

@ApiTags("Orders")
@Controller("orders")
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({
    status: 201,
    description: "The order has been created successfully.",
    type: OrderDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request, validation failed or insufficient stock.",
    type: BadRequestResponseDto,
  })
  async create(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.ordersService.create(user.id, createOrderDto);
    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all orders (admin) or current user orders" })
  @ApiResponse({
    status: 200,
    description: "Return all orders based on role and user.",
    type: [OrderDto],
  })
  async findAll(@CurrentUser() user: User): Promise<OrderDto[]> {
    const orders =
      user.role === UserRole.ADMIN
        ? await this.ordersService.findAll()
        : await this.ordersService.findByUser(user.id);

    return plainToInstance(OrderDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an order by ID" })
  @ApiParam({
    name: "id",
    description: "Order ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Return the order with the specified ID.",
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: "Order not found.",
    type: NotFoundResponseDto,
  })
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<OrderDto> {
    const order = await this.ordersService.findOne(id);

    // Check if order belongs to current user or user is admin
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new NotFoundException(`Order not found`);
    }

    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an order (admin only)" })
  @ApiParam({
    name: "id",
    description: "Order ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The order has been successfully updated.",
    type: OrderDto,
  })
  @ApiResponse({
    status: 404,
    description: "Order not found.",
    type: NotFoundResponseDto,
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.ordersService.update(id, updateOrderDto);
    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel an order" })
  @ApiParam({
    name: "id",
    description: "Order ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The order has been cancelled.",
    type: OrderDto,
  })
  @ApiResponse({
    status: 400,
    description: "Cannot cancel order in current state.",
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Order not found.",
    type: NotFoundResponseDto,
  })
  async cancel(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<OrderDto> {
    // Get order to check ownership
    const order = await this.ordersService.findOne(id);

    // Only admin or order owner can cancel
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new NotFoundException(`Order not found`);
    }

    const cancelledOrder = await this.ordersService.cancel(id);
    return plainToInstance(OrderDto, cancelledOrder, {
      excludeExtraneousValues: true,
    });
  }
}
