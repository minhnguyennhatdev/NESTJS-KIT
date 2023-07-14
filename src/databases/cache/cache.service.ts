import { REDIS_PROVIDER } from '@databases/cache/redis/redis.provider';
import { Inject } from '@nestjs/common';
import { Milliseconds } from 'cache-manager';
import { Redis } from 'ioredis';

export class CacheService {
  constructor(@Inject(REDIS_PROVIDER) private readonly redis: Redis) {}

  async getOneCached<T>(
    key: string,
    cb?: () => Promise<T>,
    ttl?: Milliseconds,
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached, this.safeJSONParse);
    }
    if (cb) {
      const data: T = await cb();
      const payload = JSON.stringify(data, this.safeJSONParse);
      if (data) {
        if (ttl) {
          await this.redis.setex(key, ttl / 1000, payload);
        } else {
          await this.redis.set(key, payload);
        }
      }
      return data;
    }
    return null;
  }

  private safeJSONParse(_key, val) {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {}
    }
    return val;
  }
}
