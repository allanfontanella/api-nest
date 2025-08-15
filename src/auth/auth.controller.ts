// src/auth/auth.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Cadastro de usuário/admin
  @Post('register')
  register(@Body() body: any) {
    const { nome, email, senha, role } = body;
    if (!nome || !email || !senha) {
      throw new Error('Campos obrigatórios: nome, email, senha');
    }
    return this.auth.register({ nome, email, senha, role });
  }

  // Login -> retorna token
  @Post('login')
  login(@Body() body: any) {
    const { email, senha } = body;
    return this.auth.login(email, senha);
  }

  // Validação rápida do token
  @Post('verify')
  verify(@Body() body: any) {
    return this.auth.verify(body.token);
  }

  // Perfil do usuário logado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user; // { id, email, role }
  }

  // Excluir um login (usuário) -> admin pode excluir qualquer, usuário só o próprio
  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.auth.deleteUser(req.user, id);
  }
}
