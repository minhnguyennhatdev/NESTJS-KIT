import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from '@databases/logger/logger.module';
import { ElasticModule } from '@databases/elasticsearch/elasticsearch.module';

@Module({
  imports: [LoggerModule, ElasticModule],
  controllers: [AppController],
})
export class AppModule {}
