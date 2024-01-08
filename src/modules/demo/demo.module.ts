import { Module } from '@nestjs/common';
import { DemoController } from '@modules/demo/demo.controller';

@Module({
  controllers: [DemoController],
})
export class DemoModule {}
