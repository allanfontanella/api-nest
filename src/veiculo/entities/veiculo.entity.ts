import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    CreateDateColumn, UpdateDateColumn, OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn
  } from 'typeorm';
  import { Marca } from './marca.entity';
  import { Modelo } from './modelo.entity';

import { VeiculoOpcional } from './veiculo-opcional.entity';
import { VeiculoImagem } from './veiculo-imagem.entity';
import { Vendedor } from 'src/vendedor/vendedor.entity';

  
  export type Cambio = 'MANUAL' | 'AUTOMATICO';
  export type Condicao = 'NOVO' | 'SEMINOVO' | 'USADO' | 'SUCATA';
  export type Status = 'ATIVO' | 'INATIVO';
  // Combustível livre (string) ou troque por enum fixo se quiser
  
  @Entity('veiculos')
  export class Veiculo {
    @PrimaryGeneratedColumn() id: number;
  
    @ManyToOne(() => Marca, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'marcaId' })       // << se sua coluna no DB é marca_id
    marca: Marca | null;
    
    @ManyToOne(() => Modelo, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'modeloId' })      // << idem para modelo
    modelo: Modelo | null;
  
    @Column({ type: 'int', default: 0 }) km: number;
    @Column({ type: 'int', nullable: true }) modeloAno?: number;
    @Column({ type: 'int', nullable: true }) fabricacaoAno?: number;
    @Column({ type: 'int', nullable: true }) marchas?: number;
    @Column({ type: 'varchar', length: 15, nullable: true }) cambio?: Cambio; // 'MANUAL'|'AUTOMATICO'
    @Column({ type: 'varchar', length: 30, nullable: true }) combustivel?: string;
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true }) valor?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) tracao?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) cor?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) freio?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) rodas?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) pneu?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) tipo?: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) carroceria?: string;
    @Column({ type: 'varchar', length: 15, default: 'USADO' }) tipoVeiculo: Condicao; // NOVO, ...
    @Column({ type: 'varchar', length: 10, default: 'ATIVO' }) status: Status;
  
    @OneToMany(() => VeiculoOpcional, vop => vop.veiculo, { cascade: true })
    opcionais: VeiculoOpcional[];
  
    @OneToMany(() => VeiculoImagem, img => img.veiculo, { cascade: true })
    imagens: VeiculoImagem[];

    @ManyToMany(() => Vendedor, (v) => v.veiculos, { cascade: false })
    @JoinTable({
      name: 'veiculo_vendedores',
      joinColumn: { name: 'veiculo_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'vendedor_id', referencedColumnName: 'id' },
    })
    vendedores: Vendedor[];
  
    @CreateDateColumn() criadoEm: Date;
    @UpdateDateColumn() atualizadoEm: Date;
  }