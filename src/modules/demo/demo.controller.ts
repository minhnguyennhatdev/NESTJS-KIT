import { HttpCacheInterceptor } from '@commons/interceptors/caches/http-cache.interceptor';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller()
export class DemoController {
  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async getDemo() {
    return 'demo';
  }
}
