import { Module } from '@nestjs/common';
import { DemoController } from '@modules/demo/demo.controller';
import { DemoService } from '@modules/demo/demo.service';

@Module({
  providers: [DemoService],
  controllers: [DemoController],
})
export class DemoModule {}
