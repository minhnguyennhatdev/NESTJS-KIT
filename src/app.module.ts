import { Module } from '@nestjs/common';
import { RootModules } from '@configs/root.config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DemoModule } from '@modules/demo/demo.module';
import { PriceModule } from '@modules/price/price.modules';

const FeatureModules = [DemoModule, PriceModule];

@Module({
  imports: [...RootModules, ...FeatureModules],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
