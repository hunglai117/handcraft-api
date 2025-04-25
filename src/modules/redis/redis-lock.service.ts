import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);
  private readonly lockExpiry = 30; // Lock expiry in seconds

  constructor(private readonly redisService: RedisService) {}

  async acquireLock(
    lockName: string,
    timeoutMs = 5000,
  ): Promise<string | null> {
    const client = this.redisService.getClient();
    const lockId = uuidv4();
    const lockKey = `lock:${lockName}`;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // Try to set the lock using SET NX (only set if not exists)
      const result = await client.set(
        lockKey,
        lockId,
        "PX",
        this.lockExpiry * 1000,
        "NX",
      );

      if (result === "OK") {
        this.logger.debug(`Acquired lock ${lockName} with ID ${lockId}`);
        return lockId;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.logger.warn(`Failed to acquire lock ${lockName} after ${timeoutMs}ms`);
    return null;
  }

  async releaseLock(lockName: string, lockId: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const lockKey = `lock:${lockName}`;

    // Use Lua script to check lock ID matches before deleting
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;

    const result = await client.eval(script, 1, lockKey, lockId);
    const success = result === 1;

    if (success) {
      this.logger.debug(`Released lock ${lockName} with ID ${lockId}`);
    } else {
      this.logger.warn(
        `Failed to release lock ${lockName} with ID ${lockId}, lock expired or was taken by another process`,
      );
    }

    return success;
  }

  async withLock<T>(
    lockName: string,
    fn: () => Promise<T>,
    timeoutMs = 5000,
  ): Promise<T> {
    const lockId = await this.acquireLock(lockName, timeoutMs);
    if (!lockId) {
      throw new Error(`Failed to acquire lock: ${lockName}`);
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(lockName, lockId);
    }
  }
}
