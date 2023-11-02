import mongoose, { Document, FlattenMaps } from 'mongoose';

export type MongoModel<T> = T &
  Document<any, any, any> & { _id: mongoose.Types.ObjectId };

export type LeanMongoModel<T> = T & { _id: mongoose.Types.ObjectId };

export type ObjectMongoModel<T> = FlattenMaps<LeanMongoModel<T>>;
