// src/veiculo/veiculo-imagem.controller.ts
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VeiculoImagem } from './entities/veiculo-imagem.entity';
import { Veiculo } from './entities/veiculo.entity';
import { saveBase64Image } from '../common/storage.util';
import { toAbsoluteUrl } from 'src/helpers/url.util';
const PUBLIC_BASE = process.env.APP_PUBLIC_URL;


@Controller('veiculos/:id/imagens')
export class VeiculoImagemController {
  constructor(
    @InjectRepository(VeiculoImagem) private imgs: Repository<VeiculoImagem>,
    @InjectRepository(Veiculo) private veiculos: Repository<Veiculo>,
    // private cfg: ConfigService, // se usar @nestjs/config
  ) {}

  @Get()
  async list(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const rows = await this.imgs.find({ where: { veiculo: { id } as any }, order: { id: 'DESC' } });
    return rows.map(r => ({ ...r, absoluteUrl: toAbsoluteUrl(req, r.url, PUBLIC_BASE) }));
  }

  @Post()
async add(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() body: any) {
    const veiculo = await this.veiculos.findOne({ where: { id } });
    if (!veiculo) throw new BadRequestException('Veículo inválido');

    let url = body.url; // ideal que seja um caminho relativo tipo /uploads/...
    if (!url && body.imagemBase64) {
      const { publicPath } = await saveBase64Image(body.imagemBase64, { subfolder: `veiculos/${id}` });
      url = publicPath; // ex: /uploads/veiculos/1/abcd.png
    }
    if (!url) throw new BadRequestException('Informe url ou imagemBase64');

    // if (body.preview) {
    //   await this.imgs.update({ veiculo: { id } as any }, { preview: false });
    // }
    // ⚙️ Transação para garantir apenas 1 preview ativo

    const saved = await this.imgs.manager.transaction(async (em) => {
      if (body.preview === true) {
        // desativa todas as outras deste veículo
        await em.update(VeiculoImagem, { veiculo: { id } as any, preview: true }, { preview: false });
      }
      const novo = em.create(VeiculoImagem, { veiculo, url, preview: !!body.preview });
      return await em.save(novo);
    });

    return { ...saved, absoluteUrl: toAbsoluteUrl(req, saved.url, PUBLIC_BASE) };
  }

  @Patch(':imgId/preview')
  async setPreview(@Param('id', ParseIntPipe) id: number, @Param('imgId', ParseIntPipe) imgId: number) {
    await this.imgs.update({ veiculo: { id } as any }, { preview: false });
    await this.imgs.update({ id: imgId, veiculo: { id } as any }, { preview: true });
    return { ok: true };
  }

  @Delete(':imgId')
  async remove(@Param('id', ParseIntPipe) id: number, @Param('imgId', ParseIntPipe) imgId: number) {
    await this.imgs.delete({ id: imgId, veiculo: { id } as any });
    return { deleted: true };
  }
}
