import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import {
//   Marca, Modelo, Opcional, Veiculo, VeiculoOpcional, VeiculoImagem
// } from './entities';
import { VeiculoService } from './veiculo.service';
import { VeiculoController } from './veiculo.controller';
import { RefsController } from './refs.controller';
import { VeiculoImagemController } from './veiculo-imagem.controller';
import { Marca, Modelo, Opcional, Veiculo, VeiculoImagem, VeiculoOpcional } from './entities';
import { Vendedor } from 'src/vendedor/vendedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Marca, Modelo, Opcional, Veiculo, VeiculoOpcional, VeiculoImagem,Vendedor
  ])],
  controllers: [VeiculoController, RefsController, VeiculoImagemController],
  providers: [VeiculoService],
})
export class VeiculoModule {}
