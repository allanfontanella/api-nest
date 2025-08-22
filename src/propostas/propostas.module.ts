// src/propostas/propostas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposta } from './proposta.entity';
import { PropostasService } from './propostas.service';
import { PropostasController } from './propostas.controller';
import { MailModule } from '../mail/mail.module'; // <?

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposta]),
    MailModule, // <? aqui é o ponto que faltava
  ],
  controllers: [PropostasController],
  providers: [PropostasService],
  exports: [PropostasService],
})
export class PropostasModule { }
