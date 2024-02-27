import config from '@configs/configuration';
import { Provider } from '@nestjs/common';
import { Redis } from 'ioredis';

export const REDIS_PROVIDER = {
  CACHE: 'REDIS_CACHE_PROVIDER',
};

export const RedisCacheProvider: Provider<Redis> = {
  provide: REDIS_PROVIDER.CACHE,
  useFactory: () => new Redis(config.REDIS.CACHE.URI),
};
