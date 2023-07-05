import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import RootModule from '@configs/root.config';

@Module({
  imports: RootModule,
  controllers: [AppController],
})
export class AppModule {}
