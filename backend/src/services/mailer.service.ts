import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClient, EmailMessage } from '@azure/communication-email';

/**
 * Servicio de envío de correos electrónicos
 * Utiliza Azure Communication Services para enviar emails
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private emailClient: EmailClient | null = null;
  private senderAddress: string = 'noreply@fundacionlama.org';
  private enabled = false; // Modo degradado si falla inicialización

  /**
   * Constructor: inicializa el cliente de envío de correos si la connection string es válida.
   * Reglas de robustez:
   * - Si la cadena falta o está mal formada se entra en modo degradado sin bloquear el arranque.
   * - Se validan patrones básicos ("endpoint=" y clave/sas).
   */
  constructor(private configService: ConfigService) {
    const required = this.configService.get<string>('FEATURE_EMAIL_REQUIRED') === 'true';
    const connectionString = this.configService.get<string>('AZURE_COMMUNICATION_CONNECTION_STRING');
    this.senderAddress = this.configService.get<string>('EMAIL_SENDER_ADDRESS') || this.senderAddress;

    if (!connectionString) {
      const msg = 'MailerService deshabilitado: falta AZURE_COMMUNICATION_CONNECTION_STRING';
      if (required) {
        this.logger.error(msg);
        throw new Error('FEATURE_EMAIL_REQUIRED habilitado y falta la cadena de conexión de Azure Communication Services');
      }
      this.logger.warn(msg);
      return;
    }

    const normalized = connectionString.trim();
    const looksValid = /^endpoint=https:\/\/.*communication\.azure\.com\/?;accesskey=.+$/i.test(normalized);

    if (!looksValid) {
      const msg = 'MailerService: cadena de conexión inválida (no cumple patrón endpoint + accesskey).';
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
      this.logger.log('MailerService inicializado correctamente (Azure Communication Email).');
    } catch (error: any) {
      const msg = `MailerService: error inicializando cliente -> ${error.message}`;
      if (required) {
        this.logger.error(msg);
        throw new Error('Error crítico inicializando MailerService requerido');
      }
      this.logger.error(msg);
      this.logger.warn('MailerService operará en modo degradado (sin envío de correos).');
    }
  }

  /**
   * Indica si el servicio está habilitado (cliente válido listo para enviar).
   */
  isEnabled(): boolean {
    return this.enabled && !!this.emailClient;
  }

  /**
   * Envía un correo electrónico
   */
  async sendMail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.warn(`MailerService deshabilitado: se omite envío (subject="${options.subject}")`);
      return;
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const message: EmailMessage = {
        senderAddress: this.senderAddress,
        content: {
          subject: options.subject,
          plainText: options.text,
          html: options.html,
        },
        recipients: {
          to: recipients.map(email => ({ address: email })),
        },
      };

      const poller = await this.emailClient!.beginSend(message);
      await poller.pollUntilDone();

      this.logger.log(`Correo enviado correctamente a: ${recipients.join(', ')}`);
    } catch (error: any) {
      this.logger.error(`MailerService: error enviando correo -> ${error.message}`);
      // No relanzamos para no degradar flujo principal.
    }
  }

  /**
   * Envía email de bienvenida
   */
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

  /**
   * Envía email de confirmación de formulario
   */
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
