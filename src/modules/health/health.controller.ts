import Route from '@configs/route.config';
import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Connection } from 'mongoose';

@Controller(Route.HEALTH_CHECK.toString())
export class HealthController {
  constructor(
    @InjectConnection() private connection: Connection,
    private readonly health: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly mongooseIndicator: MongooseHealthIndicator,
  ) {}

  @HealthCheck()
  @Get(Route.HEALTH_CHECK.PING)
  async ping() {
    return 'pong';
  }

  @HealthCheck()
  @Get(Route.HEALTH_CHECK.MONGO)
  async checkDatabase() {
    return this.health.check([
      () =>
        this.mongooseIndicator.pingCheck('database', {
          connection: this.connection,
        }),
    ]);
  }

  @HealthCheck()
  @Get(Route.HEALTH_CHECK.MEMORY_HEAP)
  async checkMemoryHeap() {
    return this.health.check([
      () =>
        this.memoryHealthIndicator.checkHeap('memoryHeap', 300 * 1024 * 1024),
    ]);
  }

  @HealthCheck()
  @Get(Route.HEALTH_CHECK.MEMORY_HEAP)
  async checkMemoryRss() {
    return this.health.check([
      () => this.memoryHealthIndicator.checkRSS('memoryRss', 300 * 1024 * 1024),
    ]);
  }

  @HealthCheck()
  @Get(Route.HEALTH_CHECK.MEMORY_HEAP)
  async checkStorage() {
    return this.health.check([
      () =>
        this.diskHealthIndicator.checkStorage('diskHealth', {
          thresholdPercent: 0.75,
          path: '/',
        }),
    ]);
  }
}
