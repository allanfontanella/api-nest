import express, { json, urlencoded } from 'express';
import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';

// ⚠️ Importa o AppModule compilado pelo tsc
// (de netlify/functions/ até dist/* na raiz = ../../dist/*)
import { AppModule } from '../../dist/app.module';

function parseOrigins() {
  const raw = process.env.FRONTEND_URLS ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

let cached: ReturnType<typeof serverlessExpress> | null = null;

async function bootstrap() {
  const expressApp = express();
  expressApp.use(json({ limit: '50mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '50mb' }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  const allowlist = parseOrigins();
  app.enableCors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowlist.length === 0) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin não permitido: ${origin}`), false);
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept'],
    credentials: true,
    maxAge: 86400,
  });

  // Importante: em serverless NÃO usa app.listen()
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context) => {
  if (!cached) cached = await bootstrap();
  return cached(event, context);
};
