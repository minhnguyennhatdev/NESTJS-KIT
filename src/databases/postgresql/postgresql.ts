import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: config.DATABASE.NAME as any,
      url: config.DATABASE.URL,
      entities: [],
      ssl: true,
      synchronize: config.IS_DEVELOPMENT,
      logging: true,
      autoLoadEntities: true,
    }),
  ],
})
export class PostgreSQLModule {}
