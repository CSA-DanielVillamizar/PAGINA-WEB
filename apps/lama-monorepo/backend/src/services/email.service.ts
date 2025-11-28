import nodemailer from 'nodemailer';
import { config } from '../config/env';

/**
 * Interfaz para las opciones de envío de email.
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

/**
 * Servicio para envío de emails con nodemailer.
 * Configurado para usar SMTP con credenciales desde variables de entorno.
 */
export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // true para 465, false para otros puertos
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  /**
   * Envía un email con las opciones especificadas.
   * @param options Opciones del email (destinatario, asunto, contenido, adjuntos)
   * @returns Promise con la información del envío
   */
  static async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const mailOptions = {
        from: `"Fundación L.A.M.A. Medellín" <${config.email.from}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado exitosamente:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new Error('No se pudo enviar el email');
    }
  }

  /**
   * Envía email de confirmación de inscripción al aspirante.
   */
  static async sendApplicationConfirmation(
    to: string,
    nombreCompleto: string
  ): Promise<any> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Fundación L.A.M.A. Medellín</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreCompleto}!</h2>
            <p>Hemos recibido tu formulario de inscripción correctamente.</p>
            <p>Nuestro equipo de Gerencia de Negocios revisará tu información y te contactaremos pronto para continuar con el proceso de afiliación.</p>
            <p><strong>Próximos pasos:</strong></p>
            <ul>
              <li>Revisión de tu formulario por la Junta Directiva</li>
              <li>Contacto telefónico o por email para agendar una entrevista</li>
              <li>Proceso de aprobación y bienvenida oficial</li>
            </ul>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p><strong>Fundación L.A.M.A. Medellín</strong><br>
            Email: gerencia@fundacionlamamedellin.org</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Fundación L.A.M.A. Medellín. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Confirmación de Inscripción - Fundación L.A.M.A. Medellín',
      html: htmlContent,
    });
  }

  /**
   * Envía email con PDF de formulario a Gerencia de Negocios.
   */
  static async sendApplicationToManagement(
    formData: { nombres: string; apellidos: string; identificacion: string },
    pdfBuffer: Buffer
  ): Promise<any> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        </style>
      </head>
      <body>
        <h2>Nuevo Formulario de Inscripción</h2>
        <p><strong>Aspirante:</strong> ${formData.nombres} ${formData.apellidos}</p>
        <p><strong>Identificación:</strong> ${formData.identificacion}</p>
        <p>Se adjunta el PDF completo del formulario para su revisión.</p>
        <p><em>Este mensaje es generado automáticamente por el sistema.</em></p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: 'gerencia@fundacionlamamedellin.org',
      subject: `Nueva Inscripción: ${formData.nombres} ${formData.apellidos}`,
      html: htmlContent,
      attachments: [
        {
          filename: `formulario-${formData.identificacion}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }

  /**
   * Envía email de bienvenida a nuevo miembro aprobado.
   */
  static async sendWelcomeEmail(
    to: string,
    nombreCompleto: string
  ): Promise<any> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a la Familia L.A.M.A.!</h1>
          </div>
          <div class="content">
            <h2>Hola ${nombreCompleto},</h2>
            <p>Es un honor darte la bienvenida oficial como miembro de la <strong>Fundación L.A.M.A. Medellín</strong>.</p>
            <p>Ahora formas parte de una comunidad de motociclistas apasionados comprometidos con el compañerismo, la seguridad vial y el servicio social.</p>
            <p><strong>Próximos pasos:</strong></p>
            <ul>
              <li>Accede a tu perfil en nuestra plataforma</li>
              <li>Participa en eventos y rodadas</li>
              <li>Conoce a tus hermanos y hermanas de ruta</li>
              <li>Contribuye con la comunidad L.A.M.A.</li>
            </ul>
            <p>¡Nos vemos en la ruta!</p>
            <p><strong>Junta Directiva</strong><br>
            Fundación L.A.M.A. Medellín</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Fundación L.A.M.A. Medellín. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '¡Bienvenido a la Fundación L.A.M.A. Medellín!',
      html: htmlContent,
    });
  }
}
