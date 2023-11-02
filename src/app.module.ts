import { Module } from '@nestjs/common';
import { RootModules } from '@configs/root.config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';
import config from '@configs/configuration';

const FeatureModules = [];

@Module({
  imports: [
    ...RootModules,
    ...FeatureModules,
    ThrottlerModule.forRoot([
      {
        ttl: SECONDS_TO_MILLISECONDS.TEN,
        limit: config.NICE,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
