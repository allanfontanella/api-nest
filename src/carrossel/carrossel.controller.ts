import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CarrosselService } from './carrossel.service';
import { saveBase64Image } from 'src/common/storage.util';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { decorateCarrossel, toAbsoluteUrl } from 'src/helpers/url.util';

const PUBLIC_BASE = process.env.APP_PUBLIC_URL;

function decoreteCarrosel(v: any, req: any) {
  const imagens = (v.imagens ?? []).map((img: any) => ({
    ...img,
    absoluteUrl: toAbsoluteUrl(req, img.imagem, PUBLIC_BASE),
  }));

  let preview = imagens.find((i: any) => i.preview);
  let previewUrl = preview
    ? preview.absoluteUrl
    : v.imagem
      ? toAbsoluteUrl(req, v.imagem, PUBLIC_BASE)
      : null;

  return { ...v, previewUrl };
}



@Controller('carrossel')
export class CarrosselController {
  constructor(private service: CarrosselService) { }
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    // Aceita:
    // - imagem: URL jÃ¡ pronta
    // - imagemBase64: dataURL ou base64 puro
    let imagem = body.imagem;

    if (!imagem && body.imagemBase64) {
      try {
        const { publicPath } = await saveBase64Image(body.imagemBase64, { subfolder: 'carrossel' });
        console.log(publicPath);
        imagem = publicPath; // salva no banco o caminho pÃºblico
      } catch (e: any) {
        throw new BadRequestException(e.message || 'Falha ao salvar imagem');
      }
    }

    if (!imagem) {
      throw new BadRequestException('Informe "imagem" (URL) ou "imagemBase64".');
    }

    // Remove imagemBase64 do payload antes de salvar
    const { imagemBase64, ...rest } = body;
    return this.service.create({ ...rest, imagem });
  }

  @Get()
  async list(@Req() req: any, @Query('q') q?: string) {

    const rows = await this.service.list(q);
    return rows.map(v => decoreteCarrosel(v, req));
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const v = await this.service.get(id);
    return decorateCarrossel(v, req);
  }

  @Get('carousel')
  async carousel(@Query('limit') limit = '10', @Req() req: any) {
    const rows = await this.service.listCarousel(Number(limit));
    return rows.map(v => decoreteCarrosel(v, req));
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
