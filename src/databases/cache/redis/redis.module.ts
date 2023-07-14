import { Module } from '@nestjs/common';
import { RedisProvider } from '@databases/cache/redis/redis.provider';

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class RedisModule {}
