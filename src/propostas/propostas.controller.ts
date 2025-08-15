import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PropostasService } from './propostas.service';
import { CreatePropostaDto } from './dto/create-proposta.dto';

@Controller('propostas')
export class PropostasController {
  constructor(private readonly service: PropostasService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreatePropostaDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.list(Number(page), Number(limit));
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }
}
