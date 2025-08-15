import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from './vendedor.entity';

@Injectable()
export class VendedorService {
  constructor(@InjectRepository(Vendedor) private repo: Repository<Vendedor>) {}

  create(data: Partial<Vendedor>) {
    return this.repo.save(this.repo.create(data));
  }

  findAll() {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Vendedor não encontrado');
    return row;
  }

  async update(id: number, data: Partial<Vendedor>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  findByIds(ids: number[]) {
    if (!ids?.length) return Promise.resolve([]);
    return this.repo.findByIds(ids);
  }
}
