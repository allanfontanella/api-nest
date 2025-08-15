import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Marca, Modelo, Opcional } from './entities';
import { Vendedor } from 'src/vendedor/vendedor.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

type RefType =
  | 'marcas' | 'modelos' | 'tipos' | 'carrocerias' | 'tracoes'
  | 'cores' | 'freios' | 'rodas' | 'pneus' | 'opcionais' | 'vendedores';

@Controller('refs')
export class RefsController {
  constructor(
    @InjectRepository(Marca) private marcas: Repository<Marca>,
    @InjectRepository(Modelo) private modelos: Repository<Modelo>,
    @InjectRepository(Opcional) private opcionais: Repository<Opcional>,
    @InjectRepository(Vendedor) private vendedores: Repository<Vendedor>,
  ) {}

  private repo(t: RefType): Repository<any> {
    return ({
      marcas: this.marcas,
      modelos: this.modelos,
      opcionais: this.opcionais,
      vendedores: this.vendedores,
    } as const)[t] as Repository<any>;
  }
  
  // @UseGuards(JwtAuthGuard)
  @Post(':tipo')
  async create(@Param('tipo') tipo: RefType, @Body() body: any) {
    const r = this.repo(tipo);
    if (tipo === 'modelos' && body.marcaId) {
      return r.save(r.create({ nome: body.nome, marca: { id: body.marcaId } }));
    }
    return r.save(r.create({ nome: body.nome }));
  }

  @Get(':tipo')
  async list(
    @Param('tipo') tipo: RefType,
    @Query('q') q?: string,
    @Query('marcaId') marcaId?: string,     // filtro opcional por marca
    @Query('marca') marcaAlt?: string       // aceita também ?marca=1
  ) {
    const r = this.repo(tipo);

    // filtro por nome (para todos)
    const where: any = q ? { nome: Like(`%${q}%`) } : {};

    let options: FindManyOptions = { order: { nome: 'ASC' } };

    if (tipo === 'modelos') {
      // when modelos, incluir relação 'marca' e filtrar por marcaId se vier
      const midRaw = marcaId ?? marcaAlt;
      const mid = midRaw ? Number(midRaw) : undefined;
      if (mid && !Number.isNaN(mid)) {
        where.marca = { id: mid };
      }
      options = {
        where: Object.keys(where).length ? where : undefined,
        order: { nome: 'ASC' },
        relations: ['marca'], // traz a marca junto
      };
    } else {
      options = {
        where: Object.keys(where).length ? where : undefined,
        order: { nome: 'ASC' },
      };
    }

    return r.find(options);
  }
}

