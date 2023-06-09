import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development' || true,
  SERVICE_NAME: process.env.SERVICE_NAME || 'demo',
  PORT: process.env.PORT || 3001,
  PREFIX: process.env.PREFIX || 'api/v1',
  APP_THROTTLE: {
    TTL: Number(process.env.APP_THROTTLE_TTL) || 60,
    LIMIT: Number(process.env.APP_THROTTLE_LIMIT) || 600,
  },

  REDIS: {
    URL:
      process.env.REDIS_URL ||
      'redis://default:@127.0.0.1:6379/?allowUsernameInURI=true',

    URLS: process.env.REDIS_URL.split(',') || [
      'redis://default:@127.0.0.1:6379/?allowUsernameInURI=true',
    ],
  },

  MONGODB: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/demo',
  },

  DATABASE: {
    NAME: process.env.DATABASE_NAME || 'postgres',
    URL:
      process.env.DATABASE_URL || 'postgres://admin:admin@localhost:5432/demo',
  },

  ELASTICSEARCH: {
    NODE: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    INDEX: {},
  },
} as const;

export default config;
