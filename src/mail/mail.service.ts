import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter?: nodemailer.Transporter;

    private getTransporter() {
        if (!this.transporter) {
            const host = 'smtp.hostinger.com';
            const port = 465;
            const secure = true;

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure, // 465 => true (SSL/TLS). Para 587 use false (STARTTLS).
                auth: {
                    user: 'test@goopedir.com.br',
                    pass: 'SenhaDetest@2025',
                },
                // tls: {
                //     minVersion: 'TLSv1.2',
                //     // ATENÇÃO: só descomente em último caso de certificado mal instalado no servidor
                //     // rejectUnauthorized: false,
                // },
                logger: true,
                debug: true,
            });
        }
        return this.transporter;
    }

    async verify() {
        const tx = this.getTransporter();
        await tx.verify(); // confere conexão/autenticação
    }

    async sendSimple(opts: { to: string; subject: string; text?: string; html?: string }) {
        const from = process.env.MAIL_FROM || process.env.MAIL_USER!;
        const tx = this.getTransporter();
        const info = await tx.sendMail({
            from,
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
            html: opts.html,
        });
        this.logger.log(`E-mail enviado: ${info.messageId}`);
        return info;
    }
}
