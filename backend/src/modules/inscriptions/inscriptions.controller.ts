import { Body, Controller, Post } from '@nestjs/common'
import { SendInscriptionDto } from './dto/send-inscription.dto'
import { MailerService } from '../../services/mailer.service'
import { ConfigService } from '@nestjs/config'

@Controller('inscriptions')
export class InscriptionsController {
  constructor(private readonly mailer: MailerService, private readonly config: ConfigService) {}

  /**
   * Recibe la solicitud de inscripción, compone un correo a gerencia/fundación y opcionalmente adjunta el PDF.
   * Ruta final: POST /api/inscriptions/send-email (prefijo global /api)
   */
  @Post('send-email')
  async sendEmail(@Body() body: SendInscriptionDto) {
    const receiver = this.config.get<string>('INSCRIPTIONS_RECEIVER') || 'gerencia@fundacionlamamedellin.org'

    const subject = `Nueva inscripción: ${body.fullName}`
    const safe = (v?: string) => (v ?? '').toString()

    // Render mínimo de los datos principales + metadata plana si llega.
    const meta = body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
    const metaRows = Object.entries(meta)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #333">${k}</td><td style="padding:4px 8px;border:1px solid #333">${String(v)}</td></tr>`) 
      .join('')

    const html = `
      <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#111">
        <h2 style="margin:0 0 8px 0">Solicitud de inscripción</h2>
        <p style="margin:0 0 12px 0">Se ha recibido una nueva solicitud de inscripción desde el sitio web.</p>
        <table style="border-collapse:collapse;border:1px solid #333">
          <tr><td style="padding:4px 8px;border:1px solid #333">Nombre</td><td style="padding:4px 8px;border:1px solid #333">${safe(body.fullName)}</td></tr>
          <tr><td style="padding:4px 8px;border:1px solid #333">Email</td><td style="padding:4px 8px;border:1px solid #333">${safe(body.email)}</td></tr>
          ${metaRows}
        </table>
      </div>
    `

    await this.mailer.sendMail({
      to: [receiver],
      subject,
      html,
      // Adjunto PDF si viene; MailerService manejará si soporta o ignora adjuntos
      attachments: body.pdfBase64 && body.pdfFileName ? [{
        name: body.pdfFileName,
        contentType: 'application/pdf',
        contentBytesBase64: body.pdfBase64
      }] : undefined
    } as any)

    return { ok: true }
  }
}
