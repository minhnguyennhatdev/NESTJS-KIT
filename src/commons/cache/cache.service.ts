import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Cache, Milliseconds } from 'cache-manager';

@Injectable({ scope: Scope.DEFAULT })
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  async getOneCached<T = any>(key: string, cb?: () => T, ttl?: Milliseconds) {
    const cached = await this.cacheService.get<T>(key);
    if (cached) return cached;
    if (cb) {
      const data = await cb();
      if (data) {
        await this.cacheService.set(key, data, ttl);
      }
      return data;
    }
    return null;
  }
}
