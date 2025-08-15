// netlify/functions/api.js
const express = require('express');
const { json, urlencoded } = require('express');
const serverlessExpress = require('@vendia/serverless-express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');

// Importa o AppModule já COMPILADO pelo Nest (CJS)
const { AppModule } = require('../../dist/app.module');

let cached;

async function bootstrap() {
  const expressApp = express();
  expressApp.use(json({ limit: '50mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '50mb' }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // Se você usa CORS no main.ts, replique aqui:
  // app.enableCors({ ... });

  await app.init(); // NUNCA usar app.listen() em serverless
  return serverlessExpress({ app: expressApp });
}

exports.handler = async (event, context) => {
  if (!cached) cached = await bootstrap();
  return cached(event, context);
};
