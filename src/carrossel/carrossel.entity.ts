import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('carrossel')
export class Carrossel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  titulo: string;

  @Column({ length: 200, nullable: true })
  subtitulo?: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'text' })
  botaoTexto: string;

  @Column({ type: 'text' })
  botaoLink: string;

  @Column({ length: 500 })
  imagem: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: true })
  abrirNovaGuia: boolean;

  @Column({ type: 'int', default: 0 })
  ordem: number;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
