import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('empresa')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  empresa: string;

  @Column({ length: 150, nullable: true })
  rua: string;

  @Column({ length: 20, nullable: true })
  cep: string;

  @Column({ length: 10, nullable: true })
  numero: string;

  @Column({ length: 100, nullable: true })
  bairro: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 2, nullable: true })
  estado: string;

  @Column({ length: 20, nullable: true })
  telefone_contato: string;

  @Column({ type: 'text', nullable: true })
  funcionamento: string;

  @Column({ name: 'url_facebook', length: 255, nullable: true })
  urlFacebook: string;

  @Column({ name: 'url_instagram', length: 255, nullable: true })
  urlInstagram: string;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  visualizarPreco: boolean;

  @Column({ name: 'logo_branca', length: 255, nullable: true })
  logoBranca: string;

  @Column({ name: 'logo_verde', length: 255, nullable: true })
  logoVerde: string;

  @Column({ length: 255, nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
