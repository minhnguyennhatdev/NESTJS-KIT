import os from 'os';

export const USER_CATEGORIES = {
  NAMI: 0,
  FRAME_ONUS: 1,
  FRAME_NAMI: 2,
};

export const WALLET_TYPES = {
  SPOT: 0,
  MARGIN: 1,
  FUTURES: 2,
  P2P: 3,
  POOL: 4,
  EARN: 5,
  BROKER: 8,
  FRAME_NAMI: 9,
  INSURANCE: 10,
  FINANCE: 11,
};

export const PRODUCTS = {
  NAMI: 0,
  FRAME_ONUS: 1,
  FRAME_NAMI: 2,
};

export const STAKING_PERCENT = {
  VNDC: {
    dailyInterestPercent: 0.035,
    annualInterestPercent: 12.79,
  },
  VNST: {
    dailyInterestPercent: 0.035,
    annualInterestPercent: 12.79,
  },
  USDT: {
    dailyInterestPercent: 0.0164,
    annualInterestPercent: 6,
  },
};

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

export const USDT_VNDC_CENTER_RATE = {
  USDT_VNDC_RATE: 23400,
  USDT_VNDC_BID: 23407,
  USDT_VNDC_ASK: 23423,
};

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

// get cpu thread of server
export const CPU_THREADS = os?.cpus()?.length ?? 4;

export const OK = 'ok';
