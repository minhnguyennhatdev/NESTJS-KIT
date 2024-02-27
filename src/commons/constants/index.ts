import { CronExpression } from '@nestjs/schedule';
import os from 'os';

export const MAXIMUM_LIMIT_SIZE = {
  TWENTY: 20,
  ONE_HUNDRED: 100,
  FIVE_HUNDRED: 500,
};

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export const HTTP_METHOD = {
  get: 'get',
  GET: 'GET',
  post: 'post',
  POST: 'POST',
  delete: 'delete',
  DELETE: 'DELETE',
  put: 'put',
  PUT: 'PUT',
  patch: 'patch',
  PATCH: 'PATCH',
} as Record<Method, Method>;

export const SECONDS = {
  ONE: 1,
  THREE: 3,
  FIVE: 5,
  TEN: 10,
  THIRTY: 30,
};

export const MINUTES_TO_SECONDS = {
  ONE: SECONDS.ONE * 60,
  THREE: SECONDS.THREE * 60,
  FIVE: SECONDS.FIVE * 60,
  TEN: SECONDS.TEN * 60,
  THIRTY: SECONDS.THIRTY * 60,
};

export const SECONDS_TO_MILLISECONDS = {
  ONE: SECONDS.ONE * 1000,
  THREE: SECONDS.THREE * 1000,
  FIVE: SECONDS.FIVE * 1000,
  TEN: SECONDS.TEN * 1000,
  THIRTY: SECONDS.THIRTY * 1000,
};

export const MINUTES_TO_MILLISECONDS = {
  ONE: MINUTES_TO_SECONDS.ONE * 1000,
  THREE: MINUTES_TO_SECONDS.THREE * 1000,
  FIVE: MINUTES_TO_SECONDS.FIVE * 1000,
  TEN: MINUTES_TO_SECONDS.TEN * 1000,
  THIRTY: MINUTES_TO_SECONDS.THIRTY * 1000,
};

export const CRON_EXPRESSION = {
  ...CronExpression,
  EVERY_6_MINUTES: '*/6 * * * *',
  EVERY_7_MINUTES: '*/7 * * * *',
  EVERY_3_SECONDS: '*/3 * * * * *',
  VIETNAM_MIDNIGHT: '0 0 17 * * *',
};

// get cpu threads of server
export const CPU_THREADS = os?.cpus()?.length ?? 4;

export const OK = 'ok';
