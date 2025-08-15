// src/depoimento/depoimento.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Depoimento } from './depoimento.entity';

@Injectable()
export class DepoimentoService {
  constructor(@InjectRepository(Depoimento) private repo: Repository<Depoimento>) {}

  create(data: Partial<Depoimento>) {
    return this.repo.save(this.repo.create(data));
  }

  list(q?: string) {
    const where = q ? [{ nome: Like(`%${q}%`) }, { depoimento: Like(`%${q}%`) }] : undefined;
    return this.repo.find({ where, order: { criadoEm: 'DESC' } });
  }

  async get(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Depoimento não encontrado');
    return item;
  }

  async update(id: number, data: Partial<Depoimento>) {
    const item = await this.get(id);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.get(id);
    await this.repo.remove(item);
    return { deleted: true };
  }
}
