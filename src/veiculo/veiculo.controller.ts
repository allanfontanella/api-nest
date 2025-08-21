import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VeiculoService } from './veiculo.service';
import { toAbsoluteUrl } from 'src/helpers/url.util';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const PUBLIC_BASE = process.env.APP_PUBLIC_URL;

function decorateVeiculo(v: any, req: any) {
  const imagens = (v.imagens ?? []).map((img: any) => ({
    ...img,
    absoluteUrl: toAbsoluteUrl(req, img.url, PUBLIC_BASE),
  }));
  const preview = imagens.find((i: any) => i.preview);
  return { ...v, imagens, previewUrl: preview ? preview.absoluteUrl : null };
}

@Controller('veiculos')
export class VeiculoController {
  constructor(private service: VeiculoService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  async list(@Query('q') q: string | undefined, @Req() req: any) {
    const rows = await this.service.findAll(q);
    return rows.map(v => decorateVeiculo(v, req));
  }


  @Get('filtros')
  async filtros(
    @Query('marcaId') marcaId?: string,
    @Query('modeloId') modeloId?: string,
  ) {
    const res = await this.service.getFilters({
      marcaId: marcaId ? Number(marcaId) : undefined,
      modeloId: modeloId ? Number(modeloId) : undefined,
    });
    return res;
  }

  // >>> NOVO: busca paginada
  @Get('buscar')
  async buscar(
    @Query('q') q: string | undefined,
    @Query('marcaId') marcaId?: string,
    @Query('modeloId') modeloId?: string,
    @Query('ano') ano?: string | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('order') order?: 'recent' | 'price_asc' | 'price_desc',
    @Query('opcionaisIds') opcionaisIds?: string,   // <<< novo
    @Req() req?: any,
  ) {
    const result = await this.service.search({
      q,
      marcaId: marcaId ? Number(marcaId) : undefined,
      modeloId: modeloId ? Number(modeloId) : undefined,
      ano: ano ? ano : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      order,
      opcionaisIds: opcionaisIds
        ? opcionaisIds.split(',').map(id => Number(id.trim())).filter(n => !Number.isNaN(n))
        : undefined,
    });

    return {
      ...result,
      data: result.data.map(v => decorateVeiculo(v, req)),
    };
  }
  // @Get('buscar')
  // async buscar(
  //   @Query('q') q: string | undefined,
  //   @Query('marcaId') marcaId?: string,
  //   @Query('modeloId') modeloId?: string,
  //   @Query('ano') ano?: string | undefined,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('order') order?: 'recent' | 'price_asc' | 'price_desc',
  //   @Req() req?: any,
  // ) {
  //   const result = await this.service.search({
  //     q,
  //     marcaId: marcaId ? Number(marcaId) : undefined,
  //     modeloId: modeloId ? Number(modeloId) : undefined,
  //     ano: ano ? ano : undefined,
  //     page: page ? Number(page) : undefined,
  //     limit: limit ? Number(limit) : undefined,
  //     order,
  //   });

  //   return {
  //     ...result,
  //     data: result.data.map(v => decorateVeiculo(v, req)),
  //   };
  // }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const v = await this.service.findOne(id);
    return decorateVeiculo(v, req);
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
