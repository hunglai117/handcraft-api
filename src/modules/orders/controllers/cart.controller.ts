import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { CartService } from "../services/cart.service";
import { CartDto } from "../dto/cart.dto";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";

@ApiTags("Cart")
@Controller("cart")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current user cart" })
  @ApiResponse({
    status: 200,
    description: "Returns the user's cart",
    type: CartDto,
  })
  async getUserCart(@Req() req): Promise<CartDto> {
    const userId = req.user.id;
    const cart = await this.cartService.getOrCreateCart(userId);
    const { totalItems, subtotal } =
      await this.cartService.calculateCartTotals(cart);

    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }

  @Post("items")
  @ApiOperation({ summary: "Add item to cart" })
  @ApiResponse({
    status: 200,
    description: "Item added to cart",
    type: CartDto,
  })
  async addToCart(
    @Req() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartDto> {
    const userId = req.user.id;
    const cart = await this.cartService.addItemToCart(userId, addToCartDto);
    const { totalItems, subtotal } =
      await this.cartService.calculateCartTotals(cart);

    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }

  @Put("items/:itemId")
  @ApiOperation({ summary: "Update cart item quantity" })
  @ApiResponse({
    status: 200,
    description: "Cart item updated",
    type: CartDto,
  })
  async updateCartItem(
    @Req() req,
    @Param("itemId") itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const userId = req.user.id;
    const cart = await this.cartService.updateCartItem(
      userId,
      itemId,
      updateCartItemDto,
    );
    const { totalItems, subtotal } =
      await this.cartService.calculateCartTotals(cart);

    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }

  @Delete("items/:itemId")
  @ApiOperation({ summary: "Remove item from cart" })
  @ApiResponse({
    status: 200,
    description: "Item removed from cart",
    type: CartDto,
  })
  async removeCartItem(
    @Req() req,
    @Param("itemId") itemId: string,
  ): Promise<CartDto> {
    const userId = req.user.id;
    const cart = await this.cartService.removeCartItem(userId, itemId);
    const { totalItems, subtotal } =
      await this.cartService.calculateCartTotals(cart);

    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }

  @Delete()
  @ApiOperation({ summary: "Clear cart" })
  @ApiResponse({
    status: 200,
    description: "Cart cleared",
    type: CartDto,
  })
  async clearCart(@Req() req): Promise<CartDto> {
    const userId = req.user.id;
    const cart = await this.cartService.clearCart(userId);
    const { totalItems, subtotal } =
      await this.cartService.calculateCartTotals(cart);

    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }
}
