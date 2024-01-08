import { HttpCacheInterceptor } from '@commons/interceptors/caches/http-cache.interceptor';
import { CacheKey } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller()
export class DemoController {
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('demo')
  async getDemo() {
    return 'demo';
  }
}
