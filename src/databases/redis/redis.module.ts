import config from '@configs/configuration';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      url: config.REDIS.URL,
      isGlobal: true,
      autoResubscribe: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
