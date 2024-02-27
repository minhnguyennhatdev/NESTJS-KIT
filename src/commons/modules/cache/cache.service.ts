import { MilliSeconds } from '@commons/types/Time';
import { safeJSONParse } from '@commons/utils';
import config from '@configs/configuration';
import { REDIS_PROVIDER } from '@databases/redis/redis.providers';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  public readonly redisCache: Redis;

  constructor(@Inject(REDIS_PROVIDER.CACHE) private readonly redis: Redis) {
    this.redisCache = this.redis ?? new Redis(config.REDIS.CACHE.URI);
  }

  /**
   * Retrieves a cached value by key. If the value is not found in the cache, it will execute the provided callback function to retrieve the value and cache it for future use.
   * @param key - The key to retrieve the cached value.
   * @param cb - The callback function to execute if the value is not found in the cache.
   * @param ttl - The time-to-live (TTL) for the cached value in milliseconds.
   * @returns The cached value if found, otherwise the value retrieved from the callback function.
   */
  async getOneCached<T>(
    key: string,
    cb?: () => Promise<T>,
    ttl?: MilliSeconds,
  ): Promise<T> {
    const cached = await this.redisCache.get(key);
    if (cached) {
      return JSON.parse(cached, safeJSONParse);
    }
    if (cb) {
      const data: T = await cb();
      const payload = JSON.stringify(data, safeJSONParse);
      if (data) {
        if (ttl) {
          await this.redisCache.setex(key, ttl / 1000, payload);
        } else {
          await this.redisCache.set(key, payload);
        }
      }
      return data;
    }
    return null;
  }

  /**
   * Deletes cache entries based on a pattern.
   * @param pattern - The pattern to match cache keys.
   * @returns A promise that resolves to a boolean indicating whether the cache entries were successfully deleted.
   */
  async delByPattern(pattern: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!pattern?.includes('*')) {
        return resolve(false);
      }
      const stream = this.redisCache.scanStream({
        match: pattern,
        count: 100000,
      });
      stream.on('data', (keys) => {
        if (keys.length) {
          const pipeline = this.redisCache.pipeline();
          keys.forEach((key) => {
            pipeline.del(key);
          });
          pipeline.exec();
        }
      });
      stream.on('end', () => {
        return resolve(true);
      });
      stream.on('error', (err) => {
        console.error(err);
        return reject(false);
      });
    });
  }
}
