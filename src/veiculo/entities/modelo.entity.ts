import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { Marca } from './marca.entity';

@Entity('modelos')
@Unique('UQ_modelo_marca_nome', ['marca', 'nome']) // impede mesmo nome dentro da mesma marca
export class Modelo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120, collation: 'utf8mb4_0900_ai_ci' }) // case/acento-insensível no MySQL 8
  nome: string;

  @ManyToOne(() => Marca, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'marcaId' }) // garante o nome da coluna FK como 'marcaId'
  marca?: Marca;
}

