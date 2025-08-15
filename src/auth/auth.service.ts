// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async register(data: { nome: string; email: string; senha: string; role?: 'user' | 'admin' }) {
    return this.users.create(data.nome, data.email, data.senha, data.role ?? 'user');
  }

  async login(email: string, senha: string) {
    const user = await this.users.validatePassword(email, senha);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    };
  }

  async verify(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET || 'devsecret' });
      return { valid: true, payload };
    } catch {
      return { valid: false };
    }
  }

  // regra: admin pode apagar qualquer um; usuário só pode apagar a si mesmo
  async deleteUser(requestUser: { id: number; role: string }, id: number) {
    if (requestUser.role !== 'admin' && requestUser.id !== id) {
      throw new ForbiddenException('Sem permissão');
    }
    return this.users.remove(id);
  }
}
