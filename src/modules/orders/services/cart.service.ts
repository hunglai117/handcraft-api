import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../entities/cart.entity";
import { CartItem } from "../entities/cart-item.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Get the current cart for a user, or create a new one if one doesn't exist
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: [
        "cartItems",
        "cartItems.productVariant",
        "cartItems.productVariant.product",
      ],
    });

    if (!cart) {
      // Create a new cart for this user
      cart = this.cartRepository.create({ userId });
      cart.generateId();
      cart = await this.cartRepository.save(cart);
      cart.cartItems = [];
    }

    return cart;
  }

  /**
   * Calculate cart totals
   */
  async calculateCartTotals(
    cart: Cart,
  ): Promise<{ totalItems: number; subtotal: number }> {
    const totalItems = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const subtotal = cart.cartItems.reduce((sum, item) => {
      const price = item.productVariant ? item.productVariant.price : 0;
      return sum + price * item.quantity;
    }, 0);

    return { totalItems, subtotal };
  }

  /**
   * Add an item to the cart
   */
  async addItemToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    const { productVariantId, quantity } = addToCartDto;

    const productVariant = await this.productVariantRepository.findOne({
      where: { id: productVariantId },
      relations: ["product"],
    });

    if (!productVariant) {
      throw new NotFoundException(`Product variant not found`);
    }

    // Check stock availability
    if (productVariant.stockQuantity < quantity) {
      throw new Error(
        `Insufficient stock. Only ${productVariant.stockQuantity} available.`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if this product variant is already in the cart
    let cartItem = cart.cartItems.find(
      (item) => item.productVariantId === productVariantId,
    );

    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Add new item to cart
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productVariantId,
        quantity,
      });
      cartItem.generateId();
      await this.cartItemRepository.save(cartItem);
      cart.cartItems.push(cartItem);
    }

    return this.getOrCreateCart(userId); // Re-fetch to get updated relations
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.cartItems.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item not found`);
    }

    const productVariant = await this.productVariantRepository.findOne({
      where: { id: cartItem.productVariantId },
    });

    if (!productVariant) {
      throw new NotFoundException(`Product variant not found`);
    }

    // Check stock availability
    if (productVariant.stockQuantity < updateDto.quantity) {
      throw new Error(
        `Insufficient stock. Only ${productVariant.stockQuantity} available.`,
      );
    }

    // Update quantity
    cartItem.quantity = updateDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getOrCreateCart(userId); // Re-fetch to get updated relations
  }

  /**
   * Remove an item from the cart
   */
  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.cartItems.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item not found`);
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getOrCreateCart(userId); // Re-fetch to get updated relations
  }

  /**
   * Clear the entire cart
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // Remove all items from the cart
    if (cart.cartItems.length > 0) {
      await this.cartItemRepository.remove(cart.cartItems);
    }

    return this.getOrCreateCart(userId); // Re-fetch to get updated relations
  }
}
