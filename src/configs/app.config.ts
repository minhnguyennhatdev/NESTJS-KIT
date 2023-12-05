import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import origin from '@configs/origin.config';
import config from '@configs/configuration';
import { ExceptionHandlerInterceptor } from '@commons/interceptors/exception-handler.interceptor';

const appConfig = (app: INestApplication) => {
  app.useGlobalInterceptors(new ExceptionHandlerInterceptor());
  app.use(compression());
  app.use(helmet());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());
  app.enableCors(origin);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.setGlobalPrefix(config.PREFIX);
};

export default appConfig;
