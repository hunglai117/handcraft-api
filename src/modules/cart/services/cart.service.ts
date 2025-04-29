import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "../entities/cart.entity";
import { CartItem } from "../entities/cart-item.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { RedisLockService } from "../../redis/redis-lock.service";
import { RedisService } from "../../redis/redis.service";
import { SnowflakeIdGenerator } from "src/common/utils/snowflake.util";

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_TTL = 7 * 24 * 3600;
  private readonly CART_ITEMS_KEY_PREFIX = "cart:";
  private readonly CART_META_KEY_PREFIX = "cart:meta:";
  private readonly snowflakeIdGenerator: SnowflakeIdGenerator =
    SnowflakeIdGenerator.getInstance();

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private redisLockService: RedisLockService,
    private redisService: RedisService,
  ) {}

  private getCartHashKey(userId: string): string {
    return `${this.CART_ITEMS_KEY_PREFIX}${userId}`;
  }

  private getCartMetaKey(userId: string): string {
    return `${this.CART_META_KEY_PREFIX}${userId}`;
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const redisClient = this.redisService.getClient();

    try {
      // Check if cart exists in Redis
      const hasCart = await redisClient.exists(cartHashKey);

      if (hasCart) {
        this.logger.debug(`Cache hit for cart:${userId}`);

        // Get cart metadata (id, createdAt, etc)
        const cartMetaJson = await redisClient.get(cartMetaKey);
        let cartMeta: Partial<Cart> = {};

        if (cartMetaJson) {
          cartMeta = JSON.parse(cartMetaJson);
        }

        // Get all cart items from hash
        const cartItemsData = await redisClient.hgetall(cartHashKey);

        // Refresh TTL on access
        await redisClient.expire(cartHashKey, this.CART_TTL);
        await redisClient.expire(cartMetaKey, this.CART_TTL);

        // Return cart with items
        const cart = new Cart();
        Object.assign(cart, {
          id: cartMeta.id || "",
          userId,
          createdAt: cartMeta.createdAt || new Date(),
          updatedAt: cartMeta.updatedAt || new Date(),
          cartItems: [],
        });

        // Parse items and add to cart
        if (cartItemsData) {
          for (const [, value] of Object.entries(cartItemsData)) {
            if (value !== "empty") {
              const itemData = JSON.parse(value);
              cart.cartItems.push(itemData);
            }
          }
        }

        return cart;
      }

      this.logger.debug(
        `No cart found for user:${userId}, creating new cart in Redis only`,
      );

      const cart = new Cart();
      cart.id = this.snowflakeIdGenerator.generateId().toString();
      cart.userId = userId;
      cart.createdAt = new Date();
      cart.updatedAt = new Date();
      cart.cartItems = [];

      // Store this empty cart in Redis
      await this.storeCartInRedis(userId, cart);

      return cart;
    } catch (error) {
      this.logger.error(`Error getting cart from Redis: ${error.message}`);

      // If Redis fails, return an empty cart
      const fallbackCart = new Cart();
      fallbackCart.id = this.snowflakeIdGenerator.generateId().toString();
      fallbackCart.userId = userId;
      fallbackCart.createdAt = new Date();
      fallbackCart.updatedAt = new Date();
      fallbackCart.cartItems = [];

      return fallbackCart;
    }
  }

  private async storeCartInRedis(userId: string, cart: Cart): Promise<void> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const redisClient = this.redisService.getClient();

    try {
      // Store cart metadata
      const cartMeta = {
        id: cart.id,
        userId: cart.userId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
      await redisClient.set(
        cartMetaKey,
        JSON.stringify(cartMeta),
        "EX",
        this.CART_TTL,
      );

      // Clear existing hash if any
      if (await redisClient.exists(cartHashKey)) {
        await redisClient.del(cartHashKey);
      }

      // Store cart items in hash - each item as field in hash
      if (cart.cartItems && cart.cartItems.length > 0) {
        const pipeline = redisClient.pipeline();

        for (const item of cart.cartItems) {
          const itemData = {
            id: item.id || this.snowflakeIdGenerator.generateId().toString(),
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            productVariant: item.productVariant,
            createdAt: item.createdAt || new Date(),
            updatedAt: new Date(),
          };

          // Use productVariantId as the field name in the hash
          pipeline.hset(
            cartHashKey,
            item.productVariantId,
            JSON.stringify(itemData),
          );
        }

        pipeline.expire(cartHashKey, this.CART_TTL);
        await pipeline.exec();
      } else {
        // Create an empty hash with TTL
        await redisClient.hset(cartHashKey, "placeholder", "empty");
        await redisClient.expire(cartHashKey, this.CART_TTL);
      }

      this.logger.debug(`Stored cart in Redis for user:${userId}`);
    } catch (error) {
      this.logger.error(`Error storing cart in Redis: ${error.message}`);
      throw error;
    }
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productVariantId, quantity } = addToCartDto;
    const cartHashKey = this.getCartHashKey(userId);
    const redisClient = this.redisService.getClient();

    const lockKey = `cartlock:${userId}`;

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          // check product exists and has stock
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

          // Check if product already in cart hash
          const existingItemJson = await redisClient.hget(
            cartHashKey,
            productVariantId,
          );

          // Create or update cart item in Redis only
          let cartItem: Record<string, any>;

          if (existingItemJson && existingItemJson !== "empty") {
            // Item exists in Redis, update quantity
            cartItem = JSON.parse(existingItemJson);
            cartItem.quantity += quantity;
            cartItem.updatedAt = new Date();
          } else {
            // Item not in Redis, create new with a UUID
            cartItem = {
              id: this.snowflakeIdGenerator.generateId().toString(),
              productVariantId,
              quantity,
              productVariant,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }

          // Update Redis hash
          await redisClient.hset(
            cartHashKey,
            productVariantId,
            JSON.stringify(cartItem),
          );

          // If there was a placeholder, remove it
          if (await redisClient.hexists(cartHashKey, "placeholder")) {
            await redisClient.hdel(cartHashKey, "placeholder");
          }

          // Refresh TTL
          await redisClient.expire(cartHashKey, this.CART_TTL);
          await redisClient.expire(this.getCartMetaKey(userId), this.CART_TTL);

          // Return updated cart from Redis
          return this.getOrCreateCart(userId);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error adding item to cart: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update cart item quantity using atomic Redis operations - no database operations
   */
  async updateCartItemWithLock(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const redisClient = this.redisService.getClient();
    const lockKey = `cartlock:${userId}`;

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          // Get cart from Redis to find the item
          const cart = await this.getOrCreateCart(userId);

          // Find item by ID
          const cartItem = cart.cartItems?.find((item) => item.id === itemId);
          if (!cartItem) {
            throw new NotFoundException(
              `Cart item with ID ${itemId} not found`,
            );
          }

          const productVariantId = cartItem.productVariantId;

          if (quantity <= 0) {
            // Remove item completely if quantity zero or negative
            await redisClient.hdel(cartHashKey, productVariantId);

            // If cart is empty after this removal, add placeholder
            const itemCount = await redisClient.hlen(cartHashKey);
            if (itemCount === 0) {
              await redisClient.hset(cartHashKey, "placeholder", "empty");
            }
          } else {
            // Update in Redis only
            const existingItemJson = await redisClient.hget(
              cartHashKey,
              productVariantId,
            );

            if (existingItemJson && existingItemJson !== "empty") {
              const existingItem = JSON.parse(existingItemJson);
              existingItem.quantity = quantity;
              existingItem.updatedAt = new Date();

              await redisClient.hset(
                cartHashKey,
                productVariantId,
                JSON.stringify(existingItem),
              );
            }
          }

          // Refresh TTL
          await redisClient.expire(cartHashKey, this.CART_TTL);
          await redisClient.expire(this.getCartMetaKey(userId), this.CART_TTL);

          return this.getOrCreateCart(userId);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error updating cart item: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove cart item using Redis hash operations - no database operations
   */
  async removeCartItemWithLock(userId: string, itemId: string): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const lockKey = `cartlock:${userId}`;

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          const cart = await this.getOrCreateCart(userId);
          const cartItem = cart.cartItems?.find((item) => item.id === itemId);

          if (!cartItem) {
            throw new NotFoundException(
              `Cart item with ID ${itemId} not found`,
            );
          }

          // Remove from Redis hash only
          await this.redisService
            .getClient()
            .hdel(cartHashKey, cartItem.productVariantId);

          // If cart is empty after this removal, add placeholder
          const itemCount = await this.redisService
            .getClient()
            .hlen(cartHashKey);
          if (itemCount === 0) {
            await this.redisService
              .getClient()
              .hset(cartHashKey, "placeholder", "empty");
          }

          return this.getOrCreateCart(userId);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error removing cart item: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear entire cart in Redis only
   */
  async clearCartWithLock(userId: string): Promise<void> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const lockKey = `cartlock:${userId}`;

    try {
      await this.redisLockService.withLock(
        lockKey,
        async () => {
          // Clear Redis hash (faster than deleting keys individually)
          await this.redisService.getClient().del(cartHashKey);

          // Create empty cart hash and preserve metadata
          await this.redisService
            .getClient()
            .hset(cartHashKey, "placeholder", "empty");
          await this.redisService
            .getClient()
            .expire(cartHashKey, this.CART_TTL);
          await this.redisService
            .getClient()
            .expire(cartMetaKey, this.CART_TTL);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error clearing cart: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate cart totals from cart data in Redis
   */
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

  /**
   * Persist cart to database only when needed (e.g., at checkout)
   * This method should be called by OrderService during checkout
   */
  async persistCartToDatabase(userId: string): Promise<Cart> {
    try {
      const cart = await this.getOrCreateCart(userId);

      // Create cart in database if it doesn't exist
      let dbCart = await this.cartRepository.findOne({
        where: { userId },
      });

      if (!dbCart) {
        dbCart = this.cartRepository.create({
          userId,
          id: cart.id, // Use the ID from Redis
        });
        await this.cartRepository.save(dbCart);
      }

      // First remove any existing items
      await this.cartItemRepository.delete({ cartId: dbCart.id });

      // Add all current items from Redis
      if (cart.cartItems && cart.cartItems.length > 0) {
        for (const item of cart.cartItems) {
          const cartItem = this.cartItemRepository.create({
            id: item.id,
            cartId: dbCart.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          });
          await this.cartItemRepository.save(cartItem);
        }
      }

      this.logger.debug(`Persisted cart to database for user:${userId}`);
      return dbCart;
    } catch (error) {
      this.logger.error(`Error persisting cart to database: ${error.message}`);
      throw error;
    }
  }

  async addItemToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    return this.addToCart(userId, addToCartDto);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    return this.updateCartItemWithLock(userId, itemId, updateDto.quantity);
  }

  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    return this.removeCartItemWithLock(userId, itemId);
  }

  async clearCart(userId: string): Promise<Cart> {
    await this.clearCartWithLock(userId);
    return this.getOrCreateCart(userId);
  }
}
