import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendedor } from './vendedor.entity';
import { VendedorService } from './vendedor.service';
import { VendedorController } from './vendedor.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Vendedor])],
  providers: [VendedorService],
  controllers: [VendedorController],
  exports: [TypeOrmModule, VendedorService],
})
export class VendedorModule {}
