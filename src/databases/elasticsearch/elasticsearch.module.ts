import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import config from '@configs/configuration';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: config.ELASTICSEARCH.NODE,
    }),
  ],
  exports: [ElasticsearchModule],
})
export class ElasticModule {}
