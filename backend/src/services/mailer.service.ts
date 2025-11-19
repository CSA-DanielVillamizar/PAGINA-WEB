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
  private senderAddress: string;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_COMMUNICATION_CONNECTION_STRING');
    
    if (connectionString) {
      try {
        this.emailClient = new EmailClient(connectionString);
        this.senderAddress = this.configService.get<string>('EMAIL_SENDER_ADDRESS') || 'noreply@fundacionlama.org';
      } catch (error) {
        this.logger.error(`Error initializing email client: ${error.message}`);
      }
    } else {
      this.logger.warn('Azure Communication Services connection string not configured');
    }
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
    if (!this.emailClient) {
      this.logger.warn('Email client not configured, skipping email send');
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

      const poller = await this.emailClient.beginSend(message);
      await poller.pollUntilDone();
      
      this.logger.log(`Email sent successfully to ${recipients.join(', ')}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      throw error;
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
