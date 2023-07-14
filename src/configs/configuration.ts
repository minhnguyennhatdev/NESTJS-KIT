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

  MYSQL: {
    HOST: process.env.MYSQL_HOST || 'localhost',
    PORT: Number(process.env.MYSQL_PORT) || 3306,
    USERNAME: process.env.MYSQL_USERNAME || 'root',
    PASSWORD: process.env.MYSQL_PASSWORD || 'root',
    DATABASE: process.env.MYSQL_DATABASE || 'demo',
  },

  ELASTICSEARCH: {
    NODE: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    INDEX: {},
  },
};

export default config;
