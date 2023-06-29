import { AppModule } from '@app';
import { NestFactory } from '@nestjs/core';
import appConfig from '@configs/app.config';
import config from '@configs/configuration';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await appConfig(app);
  await app.listen(config.PORT).then(async () => {
    console.log('Server is listening on:', await app.getUrl());
  });
}
bootstrap();
