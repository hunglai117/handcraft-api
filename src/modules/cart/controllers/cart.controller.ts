import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { CartDto } from "../dto/cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { AddMultipleToCartDto } from "../dto/add-multiple-to-cart.dto";
import { Cart } from "../entities/cart.entity";
import { CartService } from "../services/cart.service";

@ApiTags("Carts")
@Controller("cart")
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user cart" })
  @ApiResponse({
    status: 200,
    description: "Returns the user cart with items",
    type: CartDto,
  })
  async getCart(@CurrentUser("id") userId: string): Promise<CartDto> {
    const cart = await this.cartService.getOrCreateCart(userId);

    return this.transformToCartDto(cart);
  }

  @Post("items")
  @ApiOperation({ summary: "Add an item to cart" })
  @ApiResponse({
    status: 201,
    description: "Item added to cart successfully",
    type: CartDto,
  })
  async addToCart(
    @CurrentUser("id") userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartDto> {
    const cart = await this.cartService.addToCart(userId, addToCartDto);

    return this.transformToCartDto(cart);
  }

  @Post("items/batch")
  @ApiOperation({ summary: "Add multiple items to cart at once" })
  @ApiResponse({
    status: 201,
    description: "Items added to cart successfully",
    type: CartDto,
  })
  async addMultipleToCart(
    @CurrentUser("id") userId: string,
    @Body() addMultipleToCartDto: AddMultipleToCartDto,
  ): Promise<CartDto> {
    const cart = await this.cartService.addMultipleItemsToCart(
      userId,
      addMultipleToCartDto,
    );

    return this.transformToCartDto(cart);
  }

  @Put("items/:itemId")
  @ApiOperation({ summary: "Update a cart item quantity" })
  @ApiResponse({
    status: 200,
    description: "Cart item updated successfully",
    type: CartDto,
  })
  async updateCartItem(
    @CurrentUser("id") userId: string,
    @Param("itemId") itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const cart = await this.cartService.updateCartItem(
      userId,
      itemId,
      updateCartItemDto,
    );

    return this.transformToCartDto(cart);
  }

  @Delete("items/:itemId")
  @ApiOperation({ summary: "Remove an item from cart" })
  @ApiResponse({
    status: 200,
    description: "Item removed from cart successfully",
    type: CartDto,
  })
  async removeCartItem(
    @CurrentUser("id") userId: string,
    @Param("itemId") itemId: string,
  ): Promise<CartDto> {
    const cart = await this.cartService.removeCartItem(userId, itemId);
    return this.transformToCartDto(cart);
  }

  @Delete()
  @ApiOperation({ summary: "Clear the entire cart" })
  @ApiResponse({
    status: 200,
    description: "Cart cleared successfully",
    type: CartDto,
  })
  async clearCart(@CurrentUser("id") userId: string): Promise<CartDto> {
    const cart = await this.cartService.clearCart(userId);
    return this.transformToCartDto(cart);
  }

  transformToCartDto(cart: Cart): CartDto {
    const cartDto = plainToInstance(CartDto, cart, {
      excludeExtraneousValues: true,
    });
    const { totalItems, subtotal } = this.cartService.calculateCartTotals(cart);
    cartDto.totalItems = totalItems;
    cartDto.subtotal = subtotal;

    return cartDto;
  }
}
