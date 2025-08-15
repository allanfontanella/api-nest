// src/users/users.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(nome: string, email: string, senha: string, role: UserRole = 'user') {
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email já cadastrado');
    const hash = await bcrypt.hash(senha, 10);
    const user = this.repo.create({ nome, email, senha: hash, role, ativo: true });
    const saved = await this.repo.save(user);
    // nunca retorne o hash
    const { senha: _, ...safe } = saved;
    return safe;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email, ativo: true } });
  }

  async findById(id: number) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return u;
  }

  async remove(id: number) {
    const u = await this.findById(id);
    await this.repo.remove(u);
    return { deleted: true };
  }

  async list() {
    const users = await this.repo.find({ order: { criadoEm: 'DESC' } });
    return users.map(({ senha, ...u }) => u);
  }

  async validatePassword(email: string, senha: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(senha, user.senha);
    return ok ? user : null;
  }
}
