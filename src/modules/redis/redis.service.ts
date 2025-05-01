import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.getOrThrow<string>("redis.host"),
      port: this.configService.getOrThrow<number>("redis.port"),
      password: this.configService.getOrThrow<string>("redis.password"),
      keyPrefix: this.configService.getOrThrow<string>("redis.keyPrefix"),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (expireInSeconds) {
      await this.redisClient.set(key, serialized, "EX", expireInSeconds);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  // async cacheOrder(
  //   orderId: string,
  //   orderData: any,
  //   expireInSeconds = 3600,
  // ): Promise<void> {
  //   await this.set(`order:${orderId}`, orderData, expireInSeconds);
  // }

  // async getOrder<T>(orderId: string): Promise<T | null> {
  //   return this.get<T>(`order:${orderId}`);
  // }

  // async invalidateOrder(orderId: string): Promise<void> {
  //   await this.delete(`order:${orderId}`);
  // }
}
