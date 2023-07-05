import { CacheService } from '@commons/cache/cache.service';
import { RedisModule } from '@databases/redis/redis.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisModule],
  providers: [CacheService],
  exports: [CacheService, RedisModule],
})
export class CacheModule {}
