import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import nodemailer, { Transporter } from 'nodemailer';

/**
 * Servicio de envío de correos electrónicos
 * Soporta dos proveedores:
 * 1) SMTP (Office 365) vía Nodemailer
 * 2) Azure Communication Services Email
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private emailClient: EmailClient | null = null;
  private smtpTransporter: Transporter | null = null;
  private senderAddress: string = 'noreply@fundacionlama.org';
  private enabled = false; // Modo degradado si falla inicialización

  constructor(private configService: ConfigService) {
    const required = this.configService.get<string>('FEATURE_EMAIL_REQUIRED') === 'true';

    // Intentar SMTP primero si hay configuración
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = Number(this.configService.get<string>('SMTP_PORT') || '587');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecureEnv = this.configService.get<string>('SMTP_SECURE');
    const smtpSecure = smtpSecureEnv === 'true' || smtpPort === 465; // STARTTLS -> secure:false
    this.senderAddress = this.configService.get<string>('SMTP_FROM')
      || this.configService.get<string>('EMAIL_SENDER_ADDRESS')
      || this.senderAddress;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure, // false para 587 STARTTLS
          auth: { user: smtpUser, pass: smtpPass },
          requireTLS: !smtpSecure, // fuerza STARTTLS
          tls: { minVersion: 'TLSv1.2' },
        } as any);
      } catch (err: any) {
        const msg = `MailerService SMTP: error creando transporter -> ${err.message}`;
        if (required) throw new Error(msg);
        this.logger.error(msg);
      }
    }

    if (this.smtpTransporter) {
      this.enabled = true;
      this.logger.log('MailerService inicializado con SMTP (Nodemailer).');
      return;
    }

    // Fallback: Azure Communication Services
    const connectionString = this.configService.get<string>('AZURE_COMMUNICATION_CONNECTION_STRING');
    if (!connectionString) {
      const msg = 'MailerService deshabilitado: falta SMTP o AZURE_COMMUNICATION_CONNECTION_STRING';
      if (required) {
        this.logger.error(msg);
        throw new Error('FEATURE_EMAIL_REQUIRED habilitado y no hay proveedor SMTP ni ACS configurado');
      }
      this.logger.warn(msg);
      return;
    }

    const normalized = connectionString.trim();
    const looksValid = /^endpoint=https:\/\/.*communication\.azure\.com\/?;accesskey=.+$/i.test(normalized);

    if (!looksValid) {
      const msg = 'MailerService: cadena de conexión ACS inválida (endpoint + accesskey).';
      if (required) {
        this.logger.error(msg);
        throw new Error('Cadena de conexión Azure Communication inválida y servicio marcado como requerido.');
      }
      this.logger.error(msg);
      return;
    }

    try {
      this.emailClient = new EmailClient(normalized);
      this.enabled = true;
      this.logger.log('MailerService inicializado con Azure Communication Email.');
    } catch (error: any) {
      const msg = `MailerService: error inicializando ACS -> ${error.message}`;
      if (required) {
        this.logger.error(msg);
        throw new Error('Error crítico inicializando MailerService requerido');
      }
      this.logger.error(msg);
      this.logger.warn('MailerService operará en modo degradado (sin envío de correos).');
    }
  }

  isEnabled(): boolean {
    return this.enabled && (!!this.emailClient || !!this.smtpTransporter);
  }

  async sendMail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{ name: string; contentType: string; contentBytesBase64: string }>
  }): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.warn(`MailerService deshabilitado: se omite envío (subject="${options.subject}")`);
      return;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    // SMTP
    if (this.smtpTransporter) {
      try {
        const attachments = (options.attachments || []).map(a => ({
          filename: a.name,
          content: Buffer.from(a.contentBytesBase64, 'base64'),
          contentType: a.contentType,
        }));
        await this.smtpTransporter.sendMail({
          from: this.senderAddress,
          to: recipients.join(', '),
          subject: options.subject,
          text: options.text,
          html: options.html,
          attachments,
        });
        this.logger.log(`Correo SMTP enviado a: ${recipients.join(', ')}`);
        return;
      } catch (error: any) {
        this.logger.error(`MailerService SMTP: error enviando correo -> ${error.message}`);
        // No devolvemos; intentamos fallback a ACS si existe
      }
    }

    // ACS
    if (this.emailClient) {
      try {
        const message: EmailMessage = {
          senderAddress: this.senderAddress,
          content: {
            subject: options.subject,
            plainText: options.text,
            html: options.html,
          },
          recipients: { to: recipients.map(email => ({ address: email })) },
          attachments: options.attachments as any,
        };
        const poller = await this.emailClient.beginSend(message);
        await poller.pollUntilDone();
        this.logger.log(`Correo ACS enviado a: ${recipients.join(', ')}`);
        return;
      } catch (error: any) {
        this.logger.error(`MailerService ACS: error enviando correo -> ${error.message}`);
      }
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Bienvenido a Fundación LAMA Medellín',
      html: `
        <h1>¡Bienvenido ${name}!</h1>
        <p>Gracias por unirte a nuestra comunidad.</p>
        <p>Estamos emocionados de tenerte con nosotros.</p>
      `,
    });
  }

  async sendFormConfirmation(email: string, formType: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Confirmación de recepción de formulario',
      html: `
        <h1>Formulario Recibido</h1>
        <p>Hemos recibido tu formulario de tipo: <strong>${formType}</strong></p>
        <p>Te contactaremos pronto.</p>
      `,
    });
  }
}
