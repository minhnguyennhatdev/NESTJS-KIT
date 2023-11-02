import { Global, Module } from '@nestjs/common';
import { CacheService } from '@commons/modules/cache/cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
