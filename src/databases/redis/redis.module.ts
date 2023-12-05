import { Global, Module } from '@nestjs/common';
import { RedisCacheProvider } from '@databases/redis/redis.providers';

@Global()
@Module({
  providers: [RedisCacheProvider],
  exports: [RedisCacheProvider],
})
export class RedisModule {}
