import config from '@configs/configuration';
import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Global()
@Module({
  imports: [
    ElasticsearchModule.register({
      node: config.ELASTICSEARCH.NODE,
    }),
  ],
  exports: [ElasticsearchModule],
})
export class EsModule {}
