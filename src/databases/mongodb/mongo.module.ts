import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadPreference } from 'mongodb';

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGODB.URI, {
      readPreference: ReadPreference.SECONDARY_PREFERRED,
    }),
  ],
})
export class MongoModule {}
