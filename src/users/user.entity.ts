// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Index({ unique: true })
  @Column({ length: 150 })
  email: string;

  @Column({ length: 200 })
  senha: string; // hash com bcrypt

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
