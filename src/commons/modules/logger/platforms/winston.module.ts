import { capitalize } from '@commons/utils';
import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule as NestWinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport, LogData } from 'winston-elasticsearch';

const TYPES = {
  TEXT_WITH_FOLDED_DATA_TYPE: {
    type: 'text',
    fields: {
      folded: {
        type: 'text',
        analyzer: 'folding',
      },
    },
  },
  TEXT_DATA_TYPE_NOT_INDEX: {
    index: false,
    type: 'text',
  },
  TEXT_DATA_TYPE: {
    index: true,
    type: 'text',
  },
  KEYWORD_DATA_TYPE: {
    type: 'keyword',
    ignore_above: 256,
  },
  KEYWORD_DATA_TYPE_NOT_INDEX: {
    index: false,
    type: 'keyword',
    ignore_above: 256,
  },
  KEYWORD_WITH_FOLDED_DATA_TYPE: {
    type: 'keyword',
    fields: {
      folded: {
        type: 'text',
        analyzer: 'folding',
      },
    },
  },
  DATE_DATA_TYPE: {
    type: 'date',
  },
  DATE_DATA_TYPE_NOT_INDEX: {
    index: false,
    type: 'date',
  },
  INTEGER_DATA_TYPE: {
    type: 'integer',
  },
  BOOLEAN_DATA_TYPE: {
    type: 'boolean',
  },
  FLOAT_DATA_TYPE: {
    type: 'float',
  },
  PHONE_NUMBER_TYPE: {
    type: 'text',
    analyzer: 'phone_number',
  },
};

const indexTemplate = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    'index.refresh_interval': '30s',
  },
  mappings: {
    dynamic: 'true',
    dynamic_templates: [
      {
        strings_as_keywords: {
          match_mapping_type: 'string',
          mapping: {
            ignore_above: 256,
            type: 'keyword',
          },
        },
      },
    ],
    date_detection: true,
    numeric_detection: true,
    properties: {
      '@timestamp': TYPES.DATE_DATA_TYPE,
      message: TYPES.TEXT_DATA_TYPE,
      severity: TYPES.KEYWORD_DATA_TYPE_NOT_INDEX,
      fields: TYPES.TEXT_DATA_TYPE,
      service: TYPES.KEYWORD_DATA_TYPE,
    },
  },
};

const transformer = function transformer(logData: LogData) {
  return {
    '@timestamp': logData.timestamp ?? new Date().toISOString(),
    message: logData.message,
    severity: logData.level,
    fields:
      typeof logData.meta === 'object'
        ? JSON.stringify(logData.meta)
        : logData.meta,
    service: config.SERVICE,
  };
};

@Module({
  imports: [
    NestWinstonModule.forRoot({
      transports: [
        new ElasticsearchTransport({
          level: 'info',
          indexPrefix: config.SERVICE,
          clientOpts: {
            node: config.ELASTICSEARCH.NODE,
          },
          transformer: transformer,
          indexTemplate,
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(
              capitalize(config.SERVICE),
              {
                colors: true,
                prettyPrint: true,
              },
            ),
          ),
        }),
      ],
      exitOnError: false,
    }),
  ],
  exports: [NestWinstonModule],
})
export class WinstonModule {}
