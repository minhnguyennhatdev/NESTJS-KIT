import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const DATABASE_TYPE = 'postgres';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DATABASE_TYPE,
      url: config.POSTGRESQL.URL,
      entities: [],
      ssl: true,
      synchronize: config.IS_DEVELOPMENT,
      logging: true,
      autoLoadEntities: true,
    }),
  ],
})
export class PostgreSQLModule {}
