import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );
    cachedApp.enableCors();
    await cachedApp.init();
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
