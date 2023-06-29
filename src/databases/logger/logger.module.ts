import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
const transformer = function transformer(logData) {
  return {
    '@timestamp': logData.timestamp
      ? logData.timestamp
      : new Date().toISOString(),
    message: logData.message,
    severity: logData.level,
    fields: logData.meta,
    service: config.SERVICE_NAME,
  };
};

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new ElasticsearchTransport({
          level: 'info',
          indexPrefix: config.SERVICE_NAME,
          clientOpts: {
            node: config.ELASTICSEARCH.NODE,
            tls: {
              rejectUnauthorized: false,
            },
          },
          transformer: transformer,
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(config.SERVICE_NAME, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
