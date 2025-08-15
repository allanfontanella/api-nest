import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('opcionais') export class Opcional {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) nome: string;
}