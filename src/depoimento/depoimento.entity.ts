// src/depoimento/depoimento.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('depoimentos')
export class Depoimento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text' })
  depoimento: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
