import { CacheModule as NestjsCacheModules } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@databases/redis/redis.module';
import { MongoDBModule } from '@databases/mongo/mongo.module';
import { EsModule } from '@databases/elasticsearch/elasticsearch.module';
import config from '@configs/configuration';
import { LoggerModule } from '@commons/modules/logger/logger.module';
import { CacheModule } from '@commons/modules/cache/cache.module';
import { LockModule } from '@commons/modules/lock/lock.module';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';

export const RootModules = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ThrottlerModule.forRoot([
    {
      ttl: SECONDS_TO_MILLISECONDS.TEN,
      limit: config.NICE,
    },
  ]),
  BullModule.forRoot({
    url: config.REDIS.CACHE.URI,
  }),
  NestjsCacheModules.register<RedisClientOptions>({
    store: redisStore,
    url: config.REDIS.CACHE.URI,
    ttl: config.REDIS.CACHE.EXPIRE_TIME,
    isGlobal: true,
  }),

  MongoDBModule,
  RedisModule,
  EsModule,

  CacheModule,
  LoggerModule,
  LockModule,
];
