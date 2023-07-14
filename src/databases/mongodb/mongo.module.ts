import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadPreference } from 'mongodb';
import mongoose from 'mongoose';

mongoose.set('debug', { color: true, shell: true });

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGODB.URI, {
      readPreference: ReadPreference.SECONDARY_PREFERRED,
    }),
  ],
})
export class MongoModule {}
