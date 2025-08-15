// src/app.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CarrosselModule } from './carrossel/carrossel.module';
import { DepoimentoModule } from './depoimento/depoimento.module';
import { VeiculoModule } from './veiculo/veiculo.module';
import { EmpresaModule } from './empresa/empresa.module';
import { VendedorModule } from './vendedor/vendedor.module';
import { PropostasModule } from './propostas/propostas.module';

function validateEnv(config: Record<string, unknown>) {
  const required = (key: string) => {
    const v = config[key];
    if (v === undefined || v === null || v === '') {
      throw new Error(`Missing env ${key}`);
    }
    return String(v);
  };
  const toNumber = (key: string, fallback: number) => {
    const raw = config[key];
    if (raw === undefined || raw === null || raw === '') return fallback;
    const n = Number(raw);
    if (Number.isNaN(n)) throw new Error(`Env ${key} must be a number`);
    return n;
  };
  const toBool = (key: string, fallback = false) => {
    const raw = config[key];
    if (raw === undefined || raw === null || raw === '') return fallback;
    const s = String(raw).toLowerCase();
    return ['1', 'true', 'yes', 'y', 'on'].includes(s);
  };
  const get = (key: string, fallback: string) =>
    (config[key] === undefined || config[key] === null || config[key] === '')
      ? fallback
      : String(config[key]);

  return {
    DB_HOST: required('DB_HOST'),
    DB_PORT: toNumber('DB_PORT', 3306),
    DB_USER: required('DB_USER'),
    DB_PASS: get('DB_PASS', ''),
    DB_NAME: required('DB_NAME'),
    DB_SYNC: toBool('DB_SYNC', false),
    DB_CHARSET: get('DB_CHARSET', 'utf8mb4'),
    UPLOADS_DIR: get('UPLOADS_DIR', 'uploads'),
    SERVE_ROOT: get('SERVE_ROOT', '/uploads'),
    MAIL_HOST: get('MAIL_HOST',''),
  };
}



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env.production', '.env']
          : ['.env', '.env.production'],
      validate: validateEnv, // <<< sem Joi
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST'),
        port: cfg.get<number>('DB_PORT'),
        username: cfg.get<string>('DB_USER'),
        password: cfg.get<string>('DB_PASS'),
        database: cfg.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // em prod: use migrations
        // synchronize: cfg.get<boolean>('DB_SYNC'),
        charset: cfg.get<string>('DB_CHARSET'),
      }),
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host: cfg.get<string>('MAIL_HOST'),
          port: Number(cfg.get<string>('MAIL_PORT') ?? 587),
          secure: cfg.get<string>('MAIL_SECURE'), // true se porta 465
          auth: {
            user: cfg.get<string>('MAIL_USER'),
            pass: cfg.get<string>('MAIL_PASS'),
          },
          logger: true, // mostra no console qual host/porta está usando
          debug: true,
        },
        defaults: {
          from: cfg.get<string>('MAIL_FROM'),
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),

    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ([
        {
          rootPath: join(process.cwd(), cfg.get<string>('UPLOADS_DIR')!),
          serveRoot: cfg.get<string>('SERVE_ROOT'),
        },
      ]),
    }),

    
    CarrosselModule,
    DepoimentoModule,
    UsersModule,
    AuthModule,
    VeiculoModule,
    EmpresaModule,
    VendedorModule,
    PropostasModule
  ],
})

export class AppModule {}
