import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { toAbsoluteUrl } from 'src/helpers/url.util';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


const PUBLIC_BASE = process.env.APP_PUBLIC_URL;

@Controller('empresa')
export class EmpresaController {
  constructor(private service: EmpresaService) {}

  @Get()
  async get(@Req() req: any) {
    const e = await this.service.get();
    return {
      ...e,
      logoBrancaUrl: e.logoBranca ? toAbsoluteUrl(req, e.logoBranca, PUBLIC_BASE) : null,
      logoVerdeUrl:  e.logoVerde  ? toAbsoluteUrl(req, e.logoVerde,  PUBLIC_BASE) : null,
      iconUrl:       e.icon       ? toAbsoluteUrl(req, e.icon,       PUBLIC_BASE) : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(@Body() dto: UpdateEmpresaDto) {
    return this.service.update(dto);
  }
}
