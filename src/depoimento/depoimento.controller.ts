// src/depoimento/depoimento.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DepoimentoService } from './depoimento.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('depoimentos')
export class DepoimentoController {
  constructor(private service: DepoimentoService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    // espera: { nome, depoimento }
    console.log(body)
    return this.service.create({ nome: body.nome, depoimento: body.depoimento });
  }

  @Get()
  list(@Query('q') q?: string) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
