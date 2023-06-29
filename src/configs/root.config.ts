import config from '@configs/configuration';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MySQLModule } from '@databases/mysql/mysql.module';
import { RedisModule } from '@databases/redis/redis.module';
import { MongoModule } from '@databases/mongodb/mongo.module';
import { LoggerModule } from '@databases/logger/logger.module';

const RootModule = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ThrottlerModule.forRoot({
    ttl: config.APP_THROTTLE.TTL,
    limit: config.APP_THROTTLE.LIMIT,
  }),
  MongoModule,
  MySQLModule,
  RedisModule,
  LoggerModule,
];

export default RootModule;
