import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('marcas') export class Marca {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) nome: string;
}