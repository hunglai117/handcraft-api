import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialize Redis connection
    this.redisClient = new Redis({
      host: this.configService.get("REDIS_HOST", "localhost"),
      port: parseInt(this.configService.get("REDIS_PORT", "6379")),
      password: this.configService.get("REDIS_PASSWORD", ""),
      keyPrefix: "ecommerce:",
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  // Cache an item with optional expiration in seconds
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (expireInSeconds) {
      await this.redisClient.set(key, serialized, "EX", expireInSeconds);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }

  // Get an item from cache
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return null;
    }
  }

  // Delete an item from cache
  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  // Cache specific methods for orders
  async cacheOrder(
    orderId: string,
    orderData: any,
    expireInSeconds = 3600,
  ): Promise<void> {
    await this.set(`order:${orderId}`, orderData, expireInSeconds);
  }

  async getOrder<T>(orderId: string): Promise<T | null> {
    return this.get<T>(`order:${orderId}`);
  }

  async invalidateOrder(orderId: string): Promise<void> {
    await this.delete(`order:${orderId}`);
  }
}
