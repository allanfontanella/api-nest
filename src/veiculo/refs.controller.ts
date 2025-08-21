import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Delete,
  Put,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';

import { Marca, Modelo, Opcional, Veiculo } from './entities'; // ajuste
import { Vendedor } from 'src/vendedor/vendedor.entity'; // ajuste

// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type RefType =
  | 'marcas' | 'modelos' | 'tipos' | 'carrocerias' | 'tracoes'
  | 'cores' | 'freios' | 'rodas' | 'pneus' | 'opcionais' | 'vendedores';

type CreateDto = { nome: string; marcaId?: number };
type UpdateDto = { nome?: string; marcaId?: number };

@Controller('refs')
export class RefsController {
  constructor(
    @InjectRepository(Marca) private marcas: Repository<Marca>,
    @InjectRepository(Modelo) private modelos: Repository<Modelo>,
    @InjectRepository(Opcional) private opcionais: Repository<Opcional>,
    @InjectRepository(Vendedor) private vendedores: Repository<Vendedor>,
    @InjectRepository(Veiculo) private veiculos: Repository<Veiculo>,
  ) { }

  private repo(t: RefType): Repository<any> {
    return ({
      marcas: this.marcas,
      modelos: this.modelos,
      opcionais: this.opcionais,
      vendedores: this.vendedores,
    } as const)[t] as Repository<any>;
  }

  // ---------- GET LIST ----------
  @Get(':tipo')
  async list(
    @Param('tipo') tipo: RefType,
    @Query('q') q?: string,
    @Query('marcaId') marcaId?: string,
    @Query('marca') marcaAlt?: string
  ) {
    const r = this.repo(tipo);
    const where: any = q ? { nome: Like(`%${q}%`) } : {};
    let options: FindManyOptions = { order: { nome: 'ASC' } };

    if (tipo === 'modelos') {
      const midRaw = marcaId ?? marcaAlt;
      const mid = midRaw ? Number(midRaw) : undefined;
      if (mid && !Number.isNaN(mid)) where.marca = { id: mid };
      options = {
        where: Object.keys(where).length ? where : undefined,
        order: { nome: 'ASC' },
        relations: ['marca'],
      };
    } else {
      options = {
        where: Object.keys(where).length ? where : undefined,
        order: { nome: 'ASC' },
      };
    }
    return r.find(options);
  }

  // ---------- GET BY ID ----------
  @Get(':tipo/:id')
  async getOne(@Param('tipo') tipo: RefType, @Param('id') idParam: string) {
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) throw new NotFoundException('ID inválido');

    const r = this.repo(tipo);
    const entity =
      tipo === 'modelos'
        ? await r.findOne({ where: { id }, relations: ['marca'] })
        : await r.findOne({ where: { id } });

    if (!entity) throw new NotFoundException('Registro não encontrado');
    return entity;
  }

  // ---------- POST (CREATE) ----------
  // @UseGuards(JwtAuthGuard)
  @Post(':tipo')
  async create(@Param('tipo') tipo: RefType, @Body() body: CreateDto) {
    const r = this.repo(tipo);
    if (!body?.nome?.trim()) throw new BadRequestException('Nome é obrigatório');

    if (tipo === 'modelos') {
      if (!body.marcaId) {
        throw new BadRequestException('marcaId é obrigatório para modelos');
      }
      return r.save(r.create({ nome: body.nome.trim(), marca: { id: body.marcaId } }));
    }

    return r.save(r.create({ nome: body.nome.trim() }));
  }

  // ---------- PUT (UPDATE) ----------
  // @UseGuards(JwtAuthGuard)
  @Put(':tipo/:id')
  async update(
    @Param('tipo') tipo: RefType,
    @Param('id') idParam: string,
    @Body() body: UpdateDto
  ) {
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) throw new NotFoundException('ID inválido');

    const r = this.repo(tipo);
    const current =
      tipo === 'modelos'
        ? await r.findOne({ where: { id }, relations: ['marca'] })
        : await r.findOne({ where: { id } });

    if (!current) throw new NotFoundException('Registro não encontrado');

    // payload básico
    const patch: any = {};
    if (typeof body.nome === 'string') patch.nome = body.nome.trim();

    // modelos podem alterar a marca
    if (tipo === 'modelos' && body.marcaId) {
      patch.marca = { id: body.marcaId };
    }

    const updated = r.merge(current, patch);
    await r.save(updated);

    // retorna já com relações se for modelo
    if (tipo === 'modelos') {
      return r.findOne({ where: { id }, relations: ['marca'] });
    }
    return updated;
  }

  // ---------- DELETE (com verificação de uso) ----------
  // @UseGuards(JwtAuthGuard)
  @Delete(':tipo/:id')
  async remove(@Param('tipo') tipo: RefType, @Param('id') idParam: string) {
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) throw new NotFoundException('ID inválido');

    const r = this.repo(tipo);
    const exists = await r.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Registro não encontrado');

    // bloqueia exclusão se houver veículos vinculados
    if (tipo === 'marcas') {
      const count = await this.veiculos.count({ where: { marca: { id } } });
      if (count > 0) {
        throw new ConflictException(
          `Não é possível excluir: há ${count} veículo(s) cadastrado(s) com esta Marca.`
        );
      }
    }

    if (tipo === 'modelos') {
      const count = await this.veiculos.count({ where: { modelo: { id } } });
      if (count > 0) {
        throw new ConflictException(
          `Não é possível excluir: há ${count} veículo(s) cadastrado(s) com este Modelo.`
        );
      }
    }

    if (tipo === 'opcionais') {
      const count = await this.veiculos
        .createQueryBuilder('v')
        .leftJoin('v.opcionais', 'o')
        .where('o.id = :id', { id })
        .getCount();
      if (count > 0) {
        throw new ConflictException(
          `Não é possível excluir: há ${count} veículo(s) cadastrado(s) com este Opcional.`
        );
      }
    }

    await r.delete(id);
    return { ok: true, message: 'Excluído com sucesso.' };
  }
}
