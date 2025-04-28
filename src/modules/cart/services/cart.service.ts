import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../entities/cart.entity";
import { CartItem } from "../entities/cart-item.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { RedisLockService } from "../../redis/redis-lock.service";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private redisLockService: RedisLockService,
  ) {}

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
      cart = this.cartRepository.create({ userId });
      cart.generateId();
      cart = await this.cartRepository.save(cart);
      cart.cartItems = [];
    }

    return cart;
  }

  calculateCartTotals(cart: Cart): { totalItems: number; subtotal: number } {
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

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productVariantId, quantity } = addToCartDto;

    const lockKey = `cart:${userId}`;

    return this.redisLockService.withLock(
      lockKey,
      async () => {
        const cart = await this.getOrCreateCart(userId);

        // Check if the product is already in the cart
        let cartItem = cart.cartItems?.find(
          (item) => item.productVariantId === productVariantId,
        );

        if (cartItem) {
          // Update quantity if item exists
          cartItem.quantity += quantity;
          await this.cartItemRepository.save(cartItem);
        } else {
          // Create a new cart item
          cartItem = new CartItem();
          cartItem.cartId = cart.id;
          cartItem.productVariantId = productVariantId;
          cartItem.quantity = quantity;
          cartItem.generateId();
          await this.cartItemRepository.save(cartItem);
        }

        // Refresh cart to get updated items
        return this.getOrCreateCart(userId);
      },
      3000,
    );
  }

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

  async updateCartItemWithLock(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = cart.cartItems?.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    if (quantity <= 0) {
      return this.removeCartItem(userId, itemId);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(userId);
  }

  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.cartItems.find((item) => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item not found`);
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getOrCreateCart(userId); // Re-fetch to get updated relations
  }

  async removeCartItemWithLock(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = cart.cartItems?.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // Remove all items from the cart
    if (cart.cartItems.length > 0) {
      await this.cartItemRepository.remove(cart.cartItems);
    }

    return this.getOrCreateCart(userId);
  }

  async clearCartWithLock(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.cartItems && cart.cartItems.length > 0) {
      await this.cartItemRepository.remove(cart.cartItems);
    }
  }
}
