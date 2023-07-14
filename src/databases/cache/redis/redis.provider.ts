import config from '@configs/configuration';
import { Provider } from '@nestjs/common';
import { Redis } from 'ioredis';

export const REDIS_PROVIDER = 'REDIS_PROVIDER';

export const RedisProvider: Provider = {
  provide: REDIS_PROVIDER,
  useFactory: async () => {
    return new Redis.Cluster(config.REDIS.URLS, {
      scaleReads: 'slave',
    });
  },
};
