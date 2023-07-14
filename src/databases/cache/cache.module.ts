import { CacheService } from '@databases/cache/cache.service';
import { RedisModule } from '@databases/cache/redis/redis.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisModule],
  providers: [CacheService],
  exports: [CacheService, RedisModule],
})
export class CacheModule {}
