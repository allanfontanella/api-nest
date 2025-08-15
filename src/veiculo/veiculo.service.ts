import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Veiculo } from './entities/veiculo.entity';
import { Marca, Modelo,  Opcional, VeiculoOpcional } from './entities';
import { Vendedor } from 'src/vendedor/vendedor.entity';

@Injectable()
export class VeiculoService {
  constructor(
    @InjectRepository(Veiculo) private repo: Repository<Veiculo>,
    @InjectRepository(Marca) private marcas: Repository<Marca>,
    @InjectRepository(Modelo) private modelos: Repository<Modelo>,
    // @InjectRepository(Tipo) private tipos: Repository<Tipo>,
    // @InjectRepository(Carroceria) private carrocerias: Repository<Carroceria>,
    // @InjectRepository(Tracao) private tracoes: Repository<Tracao>,
    // @InjectRepository(Cor) private cores: Repository<Cor>,
    // @InjectRepository(Freio) private freios: Repository<Freio>,
    // @InjectRepository(Roda) private rodas: Repository<Roda>,
    // @InjectRepository(Pneu) private pneus: Repository<Pneu>,
    @InjectRepository(Opcional) private opcionaisRepo: Repository<Opcional>,
    @InjectRepository(VeiculoOpcional) private veiculoOpcional: Repository<VeiculoOpcional>,
    @InjectRepository(Vendedor) private vendedoresRepo: Repository<Vendedor>,
  ) {}

  async create(body: any) {
    const v = this.repo.create({
      km: body.km ?? 0,
      modeloAno: body.modeloAno ?? null,
      fabricacaoAno: body.fabricacaoAno ?? null,
      marchas: body.marchas ?? null,
      cambio: body.cambio ?? null,
      combustivel: body.combustivel ?? null,
      valor: body.valor ?? null,
      tipoVeiculo: body.tipoVeiculo ?? 'USADO',
      status: body.status ?? 'ATIVO',
  
      // << AGORA SALVA TAMBÉM ESTES
      tracao: body.tracao ?? null,
      cor: body.cor ?? null,
      freio: body.freio ?? null,
      rodas: body.rodas ?? null,
      pneu: body.pneu ?? null,
      tipo: body.tipo ?? null,
      carroceria: body.carroceria ?? null,
    });

    // // set relations by id (opcional)
    if (body.marcaId) v.marca = await this.marcas.findOne({ where: { id: body.marcaId } });
    if (body.modeloId) v.modelo = await this.modelos.findOne({ where: { id: body.modeloId } });
    // if (body.tipoId) v.tipo = await this.tipos.findOne({ where: { id: body.tipoId } });
    // if (body.carroceriaId) v.carroceria = await this.carrocerias.findOne({ where: { id: body.carroceriaId } });
    // if (body.tracaoId) v.tracao = await this.tracoes.findOne({ where: { id: body.tracaoId } });
    // if (body.corId) v.cor = await this.cores.findOne({ where: { id: body.corId } });
    // if (body.freioId) v.freio = await this.freios.findOne({ where: { id: body.freioId } });
    // if (body.rodasId) v.rodas = await this.rodas.findOne({ where: { id: body.rodasId } });
    // if (body.pneuId) v.pneu = await this.pneus.findOne({ where: { id: body.pneuId } });

    const saved = await this.repo.save(v);

    // opcionais (ids[])
    if (Array.isArray(body.opcionaisIds) && body.opcionaisIds.length) {
      const ops = await this.opcionaisRepo.find({ where: { id: In(body.opcionaisIds) } });
      await this.veiculoOpcional.save(ops.map(op => this.veiculoOpcional.create({ veiculo: saved, opcional: op })));
    }

    if (Array.isArray(body.vendedoresIds) && body.vendedoresIds.length) {
      const vends = await this.vendedoresRepo.find({ where: { id: In(body.vendedoresIds) } });
      saved.vendedores = vends;
      await this.repo.save(saved);
    }

    return this.findOne(saved.id);
  }

  findAll(q?: string) {
    const where = q
      ? { combustivel: q } // simplão; se quiser a gente expande pra pesquisa em várias colunas
      : {};
    return this.repo.find({
      where: where as any,
      relations: ['marca', 'modelo', 'opcionais', 'opcionais.opcional', 'imagens','vendedores'],
      order: { criadoEm: 'DESC' },
    });
  }

  // async findOne(id: number) {
  //   const v = await this.repo.findOne({
  //     where: { id },
  //     relations: ['marca', 'modelo', 'tipo', 'carroceria', 'tracao', 'cor', 'freio', 'rodas', 'pneu', 'opcionais', 'opcionais.opcional', 'imagens','vendedores'],
  //   });
  //   if (!v) throw new NotFoundException('Veículo não encontrado');
  //   return v;
  // }

  async findOne(id: number) {
    const v = await this.repo.findOne({
      where: { id },
      relations: [
        'marca','modelo',
        'opcionais','opcionais.opcional','imagens',
        'vendedores',
      ],
    });
    if (!v) throw new NotFoundException('Veículo não encontrado');
  
    if (!v.vendedores || v.vendedores.length === 0) {
      const ativos = await this.vendedoresRepo.find({
        // where: { status: 'ativo' },
        order: { nome: 'ASC' },
      });
      // só para exibição, não persistimos:

      return { ...v, vendedores: ativos };
    }
  
    return v;
  }

  async update(id: number, body: any) {
    const v = await this.findOne(id);
    Object.assign(v, {
      km: body.km ?? v.km,
      modeloAno: body.modeloAno ?? v.modeloAno,
      fabricacaoAno: body.fabricacaoAno ?? v.fabricacaoAno,
      marchas: body.marchas ?? v.marchas,
      cambio: body.cambio ?? v.cambio,
      combustivel: body.combustivel ?? v.combustivel,
      valor: body.valor ?? v.valor,
      tipoVeiculo: body.tipoVeiculo ?? v.tipoVeiculo,
      status: body.status ?? v.status,
  
      // << incluir strings também no update
      tracao: body.tracao ?? v.tracao,
      cor: body.cor ?? v.cor,
      freio: body.freio ?? v.freio,
      rodas: body.rodas ?? v.rodas,
      pneu: body.pneu ?? v.pneu,
      tipo: body.tipo ?? v.tipo,
      carroceria: body.carroceria ?? v.carroceria,
    });

    // relations
    if ('marcaId' in body) v.marca = body.marcaId ? await this.marcas.findOne({ where: { id: body.marcaId } }) : null;
    if ('modeloId' in body) v.modelo = body.modeloId ? await this.modelos.findOne({ where: { id: body.modeloId } }) : null;
    // if ('tipoId' in body) v.tipo = body.tipoId ? await this.tipos.findOne({ where: { id: body.tipoId } }) : null;
    // if ('carroceriaId' in body) v.carroceria = body.carroceriaId ? await this.carrocerias.findOne({ where: { id: body.carroceriaId } }) : null;
    // if ('tracaoId' in body) v.tracao = body.tracaoId ? await this.tracoes.findOne({ where: { id: body.tracaoId } }) : null;
    // if ('corId' in body) v.cor = body.corId ? await this.cores.findOne({ where: { id: body.corId } }) : null;
    // if ('freioId' in body) v.freio = body.freioId ? await this.freios.findOne({ where: { id: body.freioId } }) : null;
    // if ('rodasId' in body) v.rodas = body.rodasId ? await this.rodas.findOne({ where: { id: body.rodasId } }) : null;
    // if ('pneuId' in body) v.pneu = body.pneuId ? await this.pneus.findOne({ where: { id: body.pneuId } }) : null;

    const saved = await this.repo.save(v);

    if (Array.isArray(body.opcionaisIds)) {
      // zera e recria N-N
      await this.veiculoOpcional.delete({ veiculo: { id: saved.id } as any });
      const ops = await this.opcionaisRepo.find({ where: { id: In(body.opcionaisIds) } });
      await this.veiculoOpcional.save(ops.map(op => this.veiculoOpcional.create({ veiculo: saved, opcional: op })));
    }

    if (Array.isArray(body.vendedoresIds)) {
      // redefine toda a relação
      const vends = body.vendedoresIds.length
        ? await this.vendedoresRepo.find({ where: { id: In(body.vendedoresIds) } })
        : [];
      v.vendedores = vends;
      await this.repo.save(v);
    }

    return this.findOne(saved.id);
  }

  async remove(id: number) {
    const v = await this.findOne(id);
    await this.repo.remove(v);
    return { deleted: true };
  }

  async search(params: {
    q?: string;
    marcaId?: number;
    modeloId?: number;
    ano?: string;
    page?: number;
    limit?: number;
    order?: 'recent' | 'price_asc' | 'price_desc';
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 12));
    const qb = this.repo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.marca', 'marca')
      .leftJoinAndSelect('v.modelo', 'modelo')
      .leftJoinAndSelect('v.opcionais', 'vop')
      .leftJoinAndSelect('vop.opcional', 'opcional')
      .leftJoinAndSelect('v.imagens', 'imagens')
      .leftJoinAndSelect('v.vendedores', 'vendedores')
      .where('1=1');
  
      if (params.ano) {
        qb.andWhere('v.modeloAno = :modeloAno or v.fabricacaoAno = :fabricacaoAno', { modeloAno: params.ano, fabricacaoAno: params.ano });
        // qb.andWhere('v.fabricacaoAno = :fabricacaoAno', { fabricacaoAno: params.ano });
      }
      if (params.marcaId) {
        qb.andWhere('marca.id = :marcaId', { marcaId: params.marcaId });
      }      
    if (params.modeloId) {
      qb.andWhere('modelo.id = :modeloId', { modeloId: params.modeloId });
    }
  
    if (params.q && params.q.trim()) {
      const q = `%${params.q.trim()}%`;
      qb.andWhere(
        `
        (
          marca.nome LIKE :q OR
          modelo.nome LIKE :q OR
          opcional.nome LIKE :q OR
  
          v.combustivel LIKE :q OR
          v.cambio      LIKE :q OR
          v.tracao      LIKE :q OR
          v.cor         LIKE :q OR
          v.freio       LIKE :q OR
          v.rodas       LIKE :q OR
          v.pneu        LIKE :q OR
          v.tipo        LIKE :q OR
          v.carroceria  LIKE :q OR
          v.tipoVeiculo LIKE :q OR
          v.status      LIKE :q OR
  
          CAST(v.km            AS CHAR) LIKE :q OR
          CAST(v.modeloAno     AS CHAR) LIKE :q OR
          CAST(v.fabricacaoAno AS CHAR) LIKE :q OR
          CAST(v.marchas       AS CHAR) LIKE :q OR
          CAST(v.valor         AS CHAR) LIKE :q
        )
        `,
        { q },
      );
    }
  
    // ordenação
    switch (params.order) {
      case 'price_asc':
        qb.orderBy('v.valor', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('v.valor', 'DESC');
        break;
      default:
        qb.orderBy('v.criadoEm', 'DESC'); // recent
    }
  
    qb.distinct(true) // evita duplicado por join com opcionais
      .skip((page - 1) * limit)
      .take(limit);
  
    const [rows, total] = await qb.getManyAndCount();
  
    return {
      data: rows,
      sql: qb.getSql,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getFilters(params: { marcaId?: number; modeloId?: number }) {
    const { marcaId, modeloId } = params;

    // Base para aplicar os mesmos filtros nas consultas
    const baseWhere = this.repo
      .createQueryBuilder('v')
      .leftJoin('v.marca', 'marca')
      .leftJoin('v.modelo', 'modelo')
      .where('1=1');

    if (marcaId) baseWhere.andWhere('marca.id = :marcaId', { marcaId });
    if (modeloId) baseWhere.andWhere('modelo.id = :modeloId', { modeloId });

    // ----- ANOS (pega min/max entre modeloAno e fabricacaoAno)
    // Estratégia: MIN/MAX coluna a coluna e depois combina em memória
    const agg = await baseWhere
      .clone()
      .select([
        'MIN(v.fabricacaoAno) AS minFab',
        'MIN(v.modeloAno)     AS minMod',
        'MAX(v.fabricacaoAno) AS maxFab',
        'MAX(v.modeloAno)     AS maxMod',
      ])
      .getRawOne<{
        minFab: string | null;
        minMod: string | null;
        maxFab: string | null;
        maxMod: string | null;
      }>();

    const minFab = agg?.minFab ? Number(agg.minFab) : Infinity;
    const minMod = agg?.minMod ? Number(agg.minMod) : Infinity;
    const maxFab = agg?.maxFab ? Number(agg.maxFab) : -Infinity;
    const maxMod = agg?.maxMod ? Number(agg.maxMod) : -Infinity;

    const minYear = Math.min(minFab, minMod);
    const maxYear = Math.max(maxFab, maxMod);

    const anos: number[] =
      Number.isFinite(minYear) && Number.isFinite(maxYear) && minYear <= maxYear
        ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i) // desc
        : [];

    // ----- MARCAS (apenas as que têm veículo no conjunto filtrado)
    const marcas = await baseWhere
      .clone()
      .select(['marca.id AS id', 'marca.nome AS nome'])
      .addSelect('COUNT(*)', 'total')
      .andWhere('marca.id IS NOT NULL')
      .groupBy('marca.id, marca.nome')
      .orderBy('marca.nome', 'ASC')
      .getRawMany<{ id: number; nome: string; total: string }>()
      .then(rows => rows.map(r => ({ id: Number(r.id), nome: r.nome, total: Number(r.total) })));

    // ----- MODELOS (apenas os que têm veículo; pode filtrar por marca)
    const modelosQB = baseWhere
      .clone()
      .select(['modelo.id AS id', 'modelo.nome AS nome', 'marca.id AS marcaId'])
      .addSelect('COUNT(*)', 'total')
      .andWhere('modelo.id IS NOT NULL')
      .groupBy('modelo.id, modelo.nome, marca.id')
      .orderBy('modelo.nome', 'ASC');

    const modelos = await modelosQB
      .getRawMany<{ id: number; nome: string; marcaId: number; total: string }>()
      .then(rows =>
        rows.map(r => ({
          id: Number(r.id),
          nome: r.nome,
          marcaId: Number(r.marcaId),
          total: Number(r.total),
        })),
      );

    return {
      marcas,          // [{ id, nome, total }]
      modelos,         // [{ id, nome, marcaId, total }]
      anos,            // [2025, 2024, ...]
      minYear: Number.isFinite(minYear) ? minYear : null,
      maxYear: Number.isFinite(maxYear) ? maxYear : null,
    };
  }
}