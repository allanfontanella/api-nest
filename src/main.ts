import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // <- daqui!



function parseOrigins() {
  // Ex.: FRONTEND_URLS="http://localhost:4200,https://app.seudominio.com"
  const raw = process.env.FRONTEND_URLS ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

async function bootstrap() {
  console.log('[DB ENV]', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
    pass: process.env.DB_PASS,
    passLen: (process.env.DB_PASS ?? '').length,
    passTail: (process.env.DB_PASS ?? '').slice(-2), // só os 2 últimos chars
    MailHost: process.env.MAIL_HOST,
  });
  const app = await NestFactory.create(AppModule);

  const allowlist = parseOrigins();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors({
    origin: (origin, callback) => {
      // requisições de ferramentas/SSR não têm "origin"
      if (!origin) return callback(null, true);
      if (allowlist.length === 0) return callback(null, true); // libera tudo se não configurar
      if (allowlist.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin não permitido: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // só deixe true se você realmente precisa enviar cookies/autenticação cross-site
    maxAge: 86400,     // cache do preflight
  });
  app.setGlobalPrefix(process.env.PREFIX ?? '');
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();


