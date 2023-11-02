import { Global, Module } from '@nestjs/common';
import {
  RedisCacheProvider,
  RedisPriceProvider,
} from '@databases/redis/redis.providers';

@Global()
@Module({
  providers: [RedisCacheProvider, RedisPriceProvider],
  exports: [RedisCacheProvider, RedisPriceProvider],
})
export class RedisModule {}
