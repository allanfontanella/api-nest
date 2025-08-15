import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Veiculo } from './veiculo.entity';

@Entity('veiculo_imagens')
export class VeiculoImagem {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => Veiculo, v => v.imagens, { onDelete: 'CASCADE' })
  veiculo: Veiculo;

  @Column({ length: 500 }) url: string; // salva URL pública ou caminho
  @Column({ default: false }) preview: boolean;

  @CreateDateColumn() criadoEm: Date;
}