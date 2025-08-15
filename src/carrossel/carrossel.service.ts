import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Carrossel } from './carrossel.entity';

@Injectable()
export class CarrosselService {
  constructor(@InjectRepository(Carrossel) private repo: Repository<Carrossel>) {}

  create(data: Partial<Carrossel>) {
    return this.repo.save(this.repo.create(data));
  }

  list(q?: string) {
    const where = q
      ? [{ titulo: Like(`%${q}%`) }, { subtitulo: Like(`%${q}%`) }, { descricao: Like(`%${q}%`) }]
      : undefined;
    return this.repo.find({ where, order: { ordem: 'ASC', criadoEm: 'DESC' } });
  }

  listCarousel(limit = 10) {
    return this.repo.find({ where: { ativo: true }, order: { ordem: 'ASC' }, take: limit });
  }

  async get(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Carrossel não encontrado');
    return item;
  }

  async update(id: number, data: Partial<Carrossel>) {
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
