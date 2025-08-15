import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrossel } from './carrossel.entity';
import { CarrosselController } from './carrossel.controller';
import { CarrosselService } from './carrossel.service';


@Module({
  imports: [TypeOrmModule.forFeature([Carrossel])],
  controllers: [CarrosselController],
  providers: [CarrosselService],
})
export class CarrosselModule {}

