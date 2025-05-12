import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SnowflakeIdGenerator } from "src/common/utils/snowflake.util";
import { Repository } from "typeorm";
import { RedisLockService } from "../../redis/redis-lock.service";
import { RedisService } from "../../redis/redis.service";
import { AddMultipleToCartDto } from "../dto/add-multiple-to-cart.dto";
import { AddToCartDto } from "../dto/add-to-cart.dto";
import { UpdateCartItemDto } from "../dto/update-cart-item.dto";
import { CartItem } from "../entities/cart-item.entity";
import { Cart } from "../entities/cart.entity";
import { ProductVariant } from "src/modules/products/entities/product-variant.entity";

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_TTL = 7 * 24 * 3600;
  private readonly CART_ITEMS_KEY_PREFIX = "cart:";
  private readonly CART_META_KEY_PREFIX = "cart:meta:";
  private readonly CART_LOCK_PREFIX = "cart-lock:";
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

  private getLockKey(userId: string): string {
    return `${this.CART_LOCK_PREFIX}${userId}`;
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const redisClient = this.redisService.getClient();

    try {
      const hasCart = await redisClient.exists(cartHashKey);

      if (hasCart) {
        this.logger.debug(`Cache hit for cart:${userId}`);

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

      // Cart not found in Redis, check database
      this.logger.debug(
        `No cart found in Redis for user:${userId}, checking database`,
      );

      const dbCart = await this.cartRepository.findOne({
        where: { userId },
        relations: {
          cartItems: {
            productVariant: {
              product: true,
              variantOptions: true,
            },
          },
        },
        select: {
          cartItems: {
            id: true,
            quantity: true,
            productVariantId: true,
            productVariant: {
              id: true,
              price: true,
              title: true,
              sku: true,
              image: true,
              product: {
                name: true,
              },
              variantOptions: {
                value: true,
                orderIndex: true,
              },
            },
          },
        },
      });

      if (dbCart) {
        this.logger.debug(
          `Found cart in database for user:${userId}, loading to Redis`,
        );

        await this.storeCartInRedis(userId, dbCart);

        return dbCart;
      }

      // No cart in Redis or database, create new
      this.logger.debug(`No cart found for user:${userId}, creating new cart`);

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
      this.logger.error(`Error getting cart: ${error.message}`);

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
    const cartMetaKey = this.getCartMetaKey(userId);
    const redisClient = this.redisService.getClient();
    const lockKey = this.getLockKey(userId);

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          const productVariant = await this.productVariantRepository.findOne({
            where: { id: productVariantId },
            select: {
              product: {
                name: true,
              },
              id: true,
              price: true,
              title: true,
              sku: true,
              image: true,
              variantOptions: {
                value: true,
                orderIndex: true,
              },
            },
            relations: {
              product: true,
              variantOptions: true,
            },
          });

          if (!productVariant) {
            throw new NotFoundException(
              `Product variant not found: ${productVariantId}`,
            );
          }

          // Check if cart exists in Redis
          const hasCart = await redisClient.exists(cartHashKey);
          let cart: Cart;

          if (!hasCart) {
            // If cart doesn't exist, create a new one
            cart = new Cart();
            cart.id = this.snowflakeIdGenerator.generateId().toString();
            cart.userId = userId;
            cart.createdAt = new Date();
            cart.updatedAt = new Date();

            // Create cart metadata
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
          }

          const existingItemJson = await redisClient.hget(
            cartHashKey,
            productVariantId,
          );

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

          if (productVariant.stockQuantity < cartItem.quantity) {
            throw new BadRequestException(
              `Insufficient stock. Only ${productVariant.stockQuantity} available.`,
            );
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
          await redisClient.expire(cartMetaKey, this.CART_TTL);

          return this.getOrCreateCart(userId);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error adding item to cart: ${error.message}`);
      throw error;
    }
  }

  async updateCartItemWithLock(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const redisClient = this.redisService.getClient();
    const lockKey = this.getLockKey(userId);

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
    const lockKey = this.getLockKey(userId);

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

  async removeManyCartItemsWithLock(
    userId: string,
    itemIds: string[],
  ): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const lockKey = this.getLockKey(userId);
    const redisClient = this.redisService.getClient();

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          const cart = await this.getOrCreateCart(userId);
          const itemsToRemove = cart.cartItems?.filter((item) =>
            itemIds.includes(item.id),
          );

          if (itemsToRemove.length === 0) {
            throw new NotFoundException(
              `None of the specified cart items were found`,
            );
          }

          // Create a pipeline for batch operations
          const pipeline = redisClient.pipeline();

          for (const item of itemsToRemove) {
            pipeline.hdel(cartHashKey, item.productVariantId);
          }

          await pipeline.exec();

          // If cart is empty after this removal, add placeholder
          const itemCount = await redisClient.hlen(cartHashKey);
          if (itemCount === 0) {
            await redisClient.hset(cartHashKey, "placeholder", "empty");
          }

          // Refresh TTL
          await redisClient.expire(cartHashKey, this.CART_TTL);
          await redisClient.expire(this.getCartMetaKey(userId), this.CART_TTL);

          this.logger.debug(
            `Removed ${itemsToRemove.length} items from cart for user:${userId}`,
          );
          return this.getOrCreateCart(userId);
        },
        3000,
      );
    } catch (error) {
      this.logger.error(`Error removing multiple cart items: ${error.message}`);
      throw error;
    }
  }

  async clearCartWithLock(userId: string): Promise<void> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const lockKey = this.getLockKey(userId);

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

  calculateCartItemTotals(cartItems: CartItem[]): {
    totalItems: number;
    subtotal: number;
  } {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.productVariant ? item.productVariant.price : 0;
      return sum + price * item.quantity;
    }, 0);

    return { totalItems, subtotal };
  }

  async persistCartToDatabase(userId: string): Promise<Cart> {
    try {
      const cart = await this.getOrCreateCart(userId);

      return await this.cartRepository.manager.transaction(
        async (transactionalEntityManager) => {
          let dbCart = await transactionalEntityManager.findOne(Cart, {
            where: { userId },
          });

          if (!dbCart) {
            dbCart = this.cartRepository.create({
              userId,
              id: cart.id,
            });
          }

          await transactionalEntityManager.save(dbCart);

          // First remove any existing items
          await transactionalEntityManager.delete(CartItem, {
            cartId: dbCart.id,
          });

          // Add all current items from Redis
          if (cart.cartItems && cart.cartItems.length > 0) {
            const cartItems = cart.cartItems.map((item) => {
              return this.cartItemRepository.create({
                id: item.id,
                cartId: dbCart.id,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
              });
            });

            // Save all items in a single operation
            if (cartItems.length > 0) {
              await transactionalEntityManager.save(cartItems);
            }
          }

          this.logger.debug(
            `Persisted cart to database for user:${userId} using transaction`,
          );
          return dbCart;
        },
      );
    } catch (error) {
      this.logger.error(`Error persisting cart to database: ${error.message}`);
      throw error;
    }
  }

  async getCartItemsByIds(
    userId: string,
    itemIds: string[],
  ): Promise<CartItem[]> {
    try {
      const cart = await this.getOrCreateCart(userId);

      const filteredItems = cart.cartItems.filter((item) =>
        itemIds.includes(item.id),
      );

      this.logger.debug(
        `Retrieved ${filteredItems.length} specific cart items for user:${userId}`,
      );
      return filteredItems;
    } catch (error) {
      this.logger.error(`Error getting specific cart items: ${error.message}`);
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

  async addMultipleItemsToCart(
    userId: string,
    addMultipleToCartDto: AddMultipleToCartDto,
  ): Promise<Cart> {
    const cartHashKey = this.getCartHashKey(userId);
    const cartMetaKey = this.getCartMetaKey(userId);
    const lockKey = this.getLockKey(userId);
    const redisClient = this.redisService.getClient();

    try {
      return await this.redisLockService.withLock(
        lockKey,
        async () => {
          // Get current cart or create a new one
          const cart = await this.getOrCreateCart(userId);

          // Process each item to add to cart
          for (const itemDto of addMultipleToCartDto.items) {
            // First try to find if this item already exists in the cart
            const existingItemIndex = cart.cartItems.findIndex(
              (item) => item.productVariantId === itemDto.productId,
            );

            // Get the product variant
            const productVariant = await this.productVariantRepository.findOne({
              where: { id: itemDto.productId },
              relations: ["product"],
            });

            if (!productVariant) {
              this.logger.warn(
                `Product variant not found: ${itemDto.productId}`,
              );
              continue;
            }

            // Check stock availability
            const quantity = Math.min(
              itemDto.quantity,
              productVariant.stockQuantity,
            );

            if (quantity <= 0) {
              this.logger.warn(`Item ${itemDto.productId} out of stock`);
              continue;
            }

            if (existingItemIndex >= 0) {
              // Update existing item
              const existingItem = cart.cartItems[existingItemIndex];
              existingItem.quantity += quantity;
              existingItem.updatedAt = new Date();

              // Update in Redis
              const redisCartItem = {
                id: existingItem.id,
                productVariantId: existingItem.productVariantId,
                quantity: existingItem.quantity,
                productVariant: productVariant,
                cartId: existingItem.cartId,
                createdAt: existingItem.createdAt,
                updatedAt: existingItem.updatedAt,
              };

              await redisClient.hset(
                cartHashKey,
                itemDto.productId,
                JSON.stringify(redisCartItem),
              );
            } else {
              // Create new cart item
              const newCartItem = this.cartItemRepository.create({
                productVariantId: itemDto.productId,
                quantity,
                cartId: cart.id,
              });

              // Generate ID for new item
              newCartItem.generateId();
              newCartItem.createdAt = new Date();
              newCartItem.updatedAt = new Date();

              // Add to cart items array
              cart.cartItems.push(newCartItem);

              // Add to Redis
              const redisCartItem = {
                id: newCartItem.id,
                productVariantId: newCartItem.productVariantId,
                quantity: newCartItem.quantity,
                productVariant: productVariant,
                cartId: newCartItem.cartId,
                createdAt: newCartItem.createdAt,
                updatedAt: newCartItem.updatedAt,
              };

              await redisClient.hset(
                cartHashKey,
                itemDto.productId,
                JSON.stringify(redisCartItem),
              );
            }
          }

          // If there was a placeholder, remove it
          if (await redisClient.hexists(cartHashKey, "placeholder")) {
            await redisClient.hdel(cartHashKey, "placeholder");
          }

          // Refresh TTL
          await redisClient.expire(cartHashKey, this.CART_TTL);
          await redisClient.expire(cartMetaKey, this.CART_TTL);

          return cart;
        },
        3000,
      );
    } catch (error) {
      this.logger.error(
        `Error adding multiple items to cart: ${error.message}`,
      );
      throw error;
    }
  }
}
