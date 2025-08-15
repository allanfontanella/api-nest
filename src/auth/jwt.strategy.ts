// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET || 'devsecret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // retorna o que vai para req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
