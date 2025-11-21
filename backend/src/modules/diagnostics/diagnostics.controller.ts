import { Controller, Get, Query } from '@nestjs/common';
import { BlobService } from '../../services/blob.service';
import { MailerService } from '../../services/mailer.service';

/**
 * Controlador de diagnóstico para verificar servicios externos (Blob Storage y Email).
 * Endpoints seguros para pruebas internas y monitoreo inicial.
 * Rutas: /api/diagnostics/blob y /api/diagnostics/email
 */
@Controller('api/diagnostics')
export class DiagnosticsController {
  constructor(private readonly blob: BlobService, private readonly mailer: MailerService) {}

  /**
   * Verifica estado del BlobService. Opcionalmente hace una carga de prueba si testUpload=true.
   */
  @Get('blob')
  async checkBlob(@Query('testUpload') testUpload?: string) {
    const enabled = this.blob.isEnabled?.() || false;
    const result: any = { enabled };
    if (!enabled) return result;

    if (testUpload === 'true') {
      const fileName = `diagnostic-${Date.now()}.txt`;
      const buffer = Buffer.from('diagnóstico blob ok');
      try {
        const url = await this.blob.uploadFile(fileName, buffer, 'text/plain');
        result.testUploadUrl = url;
      } catch (err: any) {
        result.testUploadError = err.message;
      }
    }
    return result;
  }

  /**
   * Verifica estado del MailerService. Si se pasa ?to=correo envía correo de prueba.
   */
  @Get('email')
  async checkEmail(@Query('to') to?: string) {
    const enabled = this.mailer.isEnabled?.() || false;
    const result: any = { enabled };
    if (!enabled) return result;

    if (to) {
      try {
        await this.mailer.sendMail({
          to,
            subject: 'Prueba Diagnóstico Email',
            html: '<h3>Correo de prueba enviado correctamente.</h3>'
        });
        result.sentTo = to;
      } catch (err: any) {
        result.sendError = err.message;
      }
    }
    return result;
  }
}
