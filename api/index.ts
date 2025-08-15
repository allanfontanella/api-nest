// api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';

import express, { json, urlencoded } from 'express';



// Copiado do seu main.ts
function parseOrigins() {
  const raw = process.env.FRONTEND_URLS ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

async function bootstrap() {
  // (opcional) debug mínimo pra não vazar secrets
  console.log('[Serverless Boot]', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    db:   process.env.DB_NAME,
    mailHostIsSet: !!process.env.MAIL_HOST,
  });

  const expressApp = express();

  // Body parsers (iguais ao seu main.ts)
  expressApp.use(json({ limit: '50mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '50mb' }));

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  // CORS (igual ao seu main.ts)
  const allowlist = parseOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);                // SSR/tools
      if (allowlist.length === 0) return callback(null, true); // libera tudo se não configurar
      if (allowlist.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin não permitido: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400,
  });

  // IMPORTANTE: em serverless NÃO chama app.listen()
  await app.init();

  return serverlessExpress({ app: expressApp });
}

// Export default para o Vercel
export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(req, res);
}
