import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proposta } from './proposta.entity';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PropostasService {
  private readonly logger = new Logger(PropostasService.name);

  constructor(
    @InjectRepository(Proposta) private repo: Repository<Proposta>,
    private mail: MailService,
  ) { }

  // async create(dto: CreatePropostaDto): Promise<Proposta> {
  //   // 1) Salvar no banco
  //   const proposta = this.repo.create(dto);
  //   const saved = await this.repo.save(proposta);

  //   // 2) Enviar e-mail
  //   try {

  //     const to = process.env.MAIL_TO ?? 'proposta@goopedir.com';
  //     await this.mailer.sendMail({
  //       to,
  //       subject: `Nova Proposta - ${saved.nome}`,
  //       template: 'proposta', // templates/proposta.hbs
  //       context: {
  //         id: saved.id,
  //         nome: saved.nome,
  //         email: saved.email,
  //         whatsapp: saved.whatsapp ?? '-',
  //         formaContato: saved.formaContato,
  //         proposta: saved.proposta,
  //         criadoEm: saved.criadoEm,
  //       },
  //     });

  //     await this.repo.update(saved.id, { emailEnviado: true });
  //     saved.emailEnviado = true;
  //   } catch (err: any) {
  //     this.logger.error('Falha ao enviar e-mail de proposta', err?.stack || err);
  //     await this.repo.update(saved.id, { emailErro: String(err?.message ?? err) });
  //     saved.emailErro = String(err?.message ?? err);
  //     // não quebrar a criação — apenas registrar o erro
  //   }

  //   return saved;
  // }
  async create(dto: CreatePropostaDto): Promise<Proposta> {
    const proposta = this.repo.create(dto);
    const saved = await this.repo.save(proposta);

    try {
      // opcional: valide conex�o
      // await this.mail.verify();

      const to = 'allan.colombo@fontanellatransportes.com.br';
      const html = `
        <h2>Nova Proposta</h2>
        <p><b>ID:</b> ${saved.id}</p>
        <p><b>Nome:</b> ${saved.nome}</p>
        <p><b>E-mail:</b> ${saved.email}</p>
        <p><b>WhatsApp:</b> ${saved.whatsapp ?? '-'}</p>
        <p><b>Forma de contato:</b> ${saved.formaContato ?? '-'}</p>
        <p><b>Proposta:</b><br/>${(saved.proposta ?? '').replace(/\n/g, '<br/>')}</p>
        <p><i>Criado em: ${saved.criadoEm?.toISOString?.() ?? saved.criadoEm}</i></p>
      `;

      await this.mail.sendSimple({
        to,
        subject: `Nova Proposta - ${saved.nome}`,
        text: 'Voc� recebeu uma nova proposta.',
        html,
      });

      await this.repo.update(saved.id, { emailEnviado: true });
      saved.emailEnviado = true;
    } catch (err: any) {
      this.logger.error('Falha ao enviar e-mail de proposta', err?.stack || err);
      await this.repo.update(saved.id, { emailErro: String(err?.message ?? err) });
      saved.emailErro = String(err?.message ?? err);
    }

    return saved;
  }


  async list(page = 1, limit = 20) {
    return this.repo.find({
      order: { criadoEm: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async get(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
