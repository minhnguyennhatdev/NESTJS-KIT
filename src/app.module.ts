import { Module } from '@nestjs/common';
import RootModule from '@configs/root.config';

@Module({
  imports: RootModule,
})
export class AppModule {}
