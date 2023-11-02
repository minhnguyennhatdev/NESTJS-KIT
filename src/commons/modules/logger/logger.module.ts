import { Global, Module } from '@nestjs/common';
import { WinstonModule } from '@commons/modules/logger/platforms/winston.module';
import { SlackModule } from '@commons/modules/logger/platforms/slack.module';
import { SystemLogger } from '@commons/modules/logger/system-logger';

@Global()
@Module({
  imports: [WinstonModule, SlackModule],
  providers: [SystemLogger],
  exports: [WinstonModule, SlackModule, SystemLogger],
})
export class LoggerModule {}
