import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Veiculo } from './veiculo.entity';
import { Opcional } from './opcional.entity';

@Entity('veiculo_opcional')
export class VeiculoOpcional {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => Veiculo, v => v.opcionais, { onDelete: 'CASCADE' })
  veiculo: Veiculo;

  @ManyToOne(() => Opcional, { eager: true, onDelete: 'CASCADE' })
  opcional: Opcional;
}