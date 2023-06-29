import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const DATABASE_TYPE = 'mysql';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: DATABASE_TYPE,
      host: config.MYSQL.HOST,
      port: config.MYSQL.PORT,
      username: config.MYSQL.USERNAME,
      password: config.MYSQL.PASSWORD,
      database: config.MYSQL.DATABASE,
      entities: [],
      synchronize: config.IS_DEVELOPMENT,
    }),
  ],
})
export class MySQLModule {}
