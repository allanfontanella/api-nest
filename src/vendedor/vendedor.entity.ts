import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Veiculo } from '../veiculo/entities/veiculo.entity';

export type VendedorStatus = 'ativo' | 'inativo';

@Entity('vendedores')
export class Vendedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 20 })
  celular: string;

  @Column({ type: 'enum', enum: ['ativo', 'inativo'], default: 'ativo' })
  status: VendedorStatus;

  @ManyToMany(() => Veiculo, (v) => v.vendedores)
  veiculos: Veiculo[];
}
