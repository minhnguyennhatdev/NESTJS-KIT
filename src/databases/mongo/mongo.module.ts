import config from '@configs/configuration';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReadPreference } from 'mongodb';

mongoose.set('debug', true);

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO.URI, {
      readPreference: ReadPreference.SECONDARY,
    }),
  ],
})
export class MongoDBModule {}
