import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './empresa.entity';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { saveBase64Image } from '../common/storage.util';

@Injectable()
export class EmpresaService {
  constructor(@InjectRepository(Empresa) private repo: Repository<Empresa>) {}

  async get() {
    let row = await this.repo.findOne({ where: { id: 1 } });
    if (!row) {
      row = this.repo.create({ id: 1, empresa: '' });
      row = await this.repo.save(row);
    }
    return row;
  }

  private async handleImage(
    _current: string | null,
    base64?: string,
    path?: string,
    subfolder?: string,
  ): Promise<string | null> {
    if (base64) {
      const { publicPath } = await saveBase64Image(base64, { subfolder });
      return publicPath;
    }
    if (typeof path === 'string') return path || null;
    return null; // sem alteração
  }

  async update(dto: UpdateEmpresaDto) {
    const row = await this.get();

    const logoBranca = await this.handleImage(row.logoBranca, dto.logoBrancaBase64, dto.logoBrancaPath, 'empresa');
    const logoVerde  = await this.handleImage(row.logoVerde,  dto.logoVerdeBase64,  dto.logoVerdePath,  'empresa');
    const icon       = await this.handleImage(row.icon,       dto.iconBase64,       dto.iconPath,       'empresa');

    const {
      logoBrancaBase64, logoBrancaPath,
      logoVerdeBase64,  logoVerdePath,
      iconBase64,       iconPath,
      ...rest
    } = dto;

    const updates: Partial<Empresa> = {
      ...rest,
      ...(logoBranca !== null ? { logoBranca } : {}),
      ...(logoVerde  !== null ? { logoVerde  } : {}),
      ...(icon       !== null ? { icon       } : {}),
    };

    const next = this.repo.merge(row, updates);
    await this.repo.save(next);

    return this.get();
  }
}
