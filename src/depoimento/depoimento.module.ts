import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depoimento } from './depoimento.entity';
import { DepoimentoController } from './depoimento.controller';
import { DepoimentoService } from './depoimento.service';



@Module({
  imports: [TypeOrmModule.forFeature([Depoimento])],
  controllers: [DepoimentoController],
  providers: [DepoimentoService],
})
export class DepoimentoModule {}

