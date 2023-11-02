import { NamiSlack } from '@commons/modules/logger/platforms/slack.module';
import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class SystemLogger {
  private readonly logger = new ConsoleLogger();

  constructor(private readonly namiSlack: NamiSlack) {}

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
    this.namiSlack.sendSlackMessage(message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }
}
