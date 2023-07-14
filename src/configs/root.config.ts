import config from '@configs/configuration';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostgreSQLModule } from '@databases/postgresql/postgresql';
import { MongoModule } from '@databases/mongodb/mongo.module';
import { LoggerModule } from '@databases/logger/logger.module';
import { ElasticModule } from '@databases/elasticsearch/elasticsearch.module';
import { UserModule } from '@modules/users/user.module';
import { HealthModule } from '@modules/health/health.module';

const DatabaseModules = [
  MongoModule,
  PostgreSQLModule,
  LoggerModule,
  ElasticModule,
];

const Modules = [UserModule, HealthModule];

const RootModule = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ThrottlerModule.forRoot({
    ttl: config.APP_THROTTLE.TTL,
    limit: config.APP_THROTTLE.LIMIT,
  }),
  ...DatabaseModules,
  ...Modules,
];

export default RootModule;
