/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Angular Nest Js Boilerplate')
    .setDescription('Angular Nest Js Boilerplate Api Description')
    .setVersion('0')
    .addTag('Angular Nest')
    .build();

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
