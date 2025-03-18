import * as dotenv from 'dotenv';
dotenv.config();

export const config = Object.freeze({
  SERVICE: process.env.SERVICE || 'demo',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 3001,
  PREFIX: process.env.PREFIX || 'api/v1',

  JWT_SECRET: process.env.JWT_SECRET || '123123',
  SERVICE_PRIVATE_KEY: process.env.SERVICE_PRIVATE_KEY || '123456',

  NICE: 69,

  MONGO: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:30001/demo',
  },

  REDIS: {
    CACHE: {
      URI:
        process.env.REDIS_CACHE_URI ||
        'redis://default:123456@127.0.0.1:6379/0?allowUsernameInURI=true',
      EXPIRE_TIME: Number(process.env.REDIS_EXPIRE_TIME) || 360,
    },
  },

  ELASTICSEARCH: {
    NODE: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    INDEXES: {},
  },

  SLACK: {
    BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    CHANNELS: {
      DEFAULT: process.env.SLACK_DEFAULT_CHANNEL,
    },
  },

  TEMPORAL_CONNECTION_URL:
    process.env.TEMPORAL_CONNECTION_URL || 'localhost:7233',
});

console.warn('--CONFIG--', config);
