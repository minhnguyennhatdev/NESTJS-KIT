import { HttpCacheInterceptor } from '@commons/interceptors/caches/http-cache.interceptor';
import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { IDemoService } from '@modules/demo/demo.interface';
import { ROUTER } from '@configs/route.config';

@Controller(ROUTER.DEMO.default)
export class DemoController {
  constructor(
    @Inject(IDemoService)
    private readonly demoService: IDemoService,
  ) {}

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async helloWorld() {
    return this.demoService.helloWorld();
  }
}
