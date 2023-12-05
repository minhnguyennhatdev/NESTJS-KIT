import { MINUTES_TO_SECONDS } from '@commons/constants';
import { Seconds } from '@commons/types/Time';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import config from '@configs/configuration';
import { REDIS_PROVIDER } from '@databases/redis/redis.providers';

/**
 * Service for managing locks using Redis.
 */
@Injectable()
export class LockService {
  private readonly redisCache: Redis;

  constructor(@Inject(REDIS_PROVIDER.CACHE) private readonly redis: Redis) {
    this.redisCache = this.redis ?? new Redis(config.REDIS.CACHE.URI);
  }

  private generateLockKey(signature: string | number): string {
    return `lock:${signature}`;
  }

  /**
   * Locks a signature for a given time-to-live (TTL).
   * @param signature - The signature to lock.
   * @param ttl - The time-to-live (TTL) for the lock in seconds.
   * @returns A promise that resolves when the lock is acquired.
   */
  async lock(
    signature: string | number,
    ttl: Seconds = MINUTES_TO_SECONDS.ONE,
  ) {
    const key = this.generateLockKey(signature);
    return await this.redisCache.setex(key, ttl, `${signature} is locked`);
  }

  /**
   * Checks if a signature is currently locked.
   * @param signature - The signature to check.
   * @returns An object containing whether the signature is locked and the time remaining until the lock expires (if locked).
   */
  async check(
    signature: string | number,
  ): Promise<{ locked: boolean; countdown: number | null }> {
    try {
      const key = this.generateLockKey(signature);
      const locked = await this.redisCache.ttl(key);
      if (locked > 0) {
        return {
          locked: true,
          countdown: locked,
        };
      }
      return {
        locked: false,
        countdown: null,
      };
    } catch (error) {
      console.error(error);
      return {
        locked: false,
        countdown: null,
      };
    }
  }

  /**
   * Unlocks a signature.
   * @param signature - The signature to unlock.
   * @returns A promise that resolves when the lock is released.
   */
  async unlock(signature: string | number) {
    const key = this.generateLockKey(signature);
    return await this.redisCache.del(key);
  }

  /**
   * Processes a callback function while ensuring the signature is locked during the process.
   * @param signature - The signature to lock.
   * @param cb - The callback function to process.
   * @param lockedCb - An optional callback function to execute if the signature is already locked.
   * @returns A promise that resolves with the result of the callback function.
   */
  async process<T = any>(
    signature: string | number,
    cb: () => Promise<T>,
    lockedCb?: () => any,
    overwriteLock = false,
  ): Promise<T> {
    const { locked } = await this.check(signature);
    if (locked && !overwriteLock) {
      console.log(`${signature} is locked`);
      if (lockedCb) return lockedCb();
      return;
    }
    try {
      await this.lock(signature);
      return await cb();
    } catch (error) {
      throw error;
    } finally {
      await this.unlock(signature);
    }
  }
}
