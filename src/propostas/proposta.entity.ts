import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type FormaContato = 'email' | 'whatsapp' | 'telefone';

@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 160 })
  email: string;

  @Column({ length: 30, nullable: true })
  whatsapp?: string;

  @Column({ type: 'varchar', length: 20 })
  formaContato: FormaContato;

  @Column({ type: 'text' })
  proposta: string;

  @CreateDateColumn()
  criadoEm: Date;

  @Column({ default: false })
  emailEnviado: boolean;

  @Column({ type: 'text', nullable: true })
  emailErro?: string;
}
