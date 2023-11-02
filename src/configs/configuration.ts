import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production' || false,
  PORT: process.env.PORT || 3001,
  PREFIX: process.env.PREFIX || 'api/v2/insurance',
  JWT_SECRET: process.env.JWT_SECRET || '123123',
  NAMI_ENDPOINT:
    process.env.NODE_ENV === 'production'
      ? 'https://nami.exchange'
      : 'https://test.nami.exchange',
  SERVICE_PRIVATE_KEY: process.env.SERVICE_PRIVATE_KEY || '123456',

  NICE: 69,

  PRICE_SPREAD_RATIO: Number(process.env.PRICE_SPREAD_RATIO) || 0.0001,

  GRPC_CLIENT: {
    WALLET: {
      NAME: 'HERO_PACKAGE',
      HOST: process.env.GRPC_WALLET_HOST,
    },
  },

  MONGO: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/demo',
  },

  REDIS: {
    CACHE: {
      URI:
        process.env.REDIS_CACHE_URI ||
        'redis://default:@127.0.0.1:6379/0?allowUsernameInURI=true',
      EXPIRE_TIME: Number(process.env.REDIS_EXPIRE_TIME) || 360,
    },
    PRICE: {
      URI:
        process.env.REDIS_PRICE_URI ||
        'redis://default:@127.0.0.1:6379/2?allowUsernameInURI=true',
    },
  },

  ELASTICSEARCH: {
    NODE: process.env.ELASTICSEARCH_NODE || 'localhost:9200',
    INDEXES: {},
  },

  BINANCE: {
    API_BASE_URL:
      process.env.BINANCE_API_ENDPOINT || 'https://testnet.binancefuture.com',
    API_KEY: process.env.BINANCE_API_KEY,
    API_SECRET: process.env.BINANCE_API_SECRET,
  },

  SLACK: {
    BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    CHANNELS: {
      ALERT: 'C05TAP544R5',
      ALERT_DEV: 'C05TR3Q5TGE',
    },
  },
} as const;

export default config;
