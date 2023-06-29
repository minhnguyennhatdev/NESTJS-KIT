import config from '@configs/configuration';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import origin from '@configs/origin.config';
import { NestExpressApplication } from '@nestjs/platform-express';

const appConfig = async (app: NestExpressApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.set('trust proxy', 1);
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());
  app.enableCors({
    origin,
    credentials: true,
  });
  app.use(compression());
  app.setGlobalPrefix(config.PREFIX ?? 'api/v1', { exclude: ['healthcheck'] });
  app.enableShutdownHooks();
};

export default appConfig;
