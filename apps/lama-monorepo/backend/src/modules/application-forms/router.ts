import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { PDFService } from '../../services/pdf.service';
import { EmailService } from '../../services/email.service';
import { z } from 'zod';

const router = Router();

const appFormSchema = z.object({
  fotoUrl: z.string().url().optional(),
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  identificacion: z.string().min(5),
  direccion: z.string().optional(),
  telefonos: z.string().optional(),
  actividadLaboral: z.string().optional(),
  parejaNombre: z.string().optional(),
  hijos: z.string().optional(),
  vehiculoMarca: z.string().optional(),
  vehiculoReferencia: z.string().optional(),
  vehiculoPlaca: z.string().optional(),
  certificacionTexto: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  correo: z.string().email().optional(),
});

router.post('/', async (req, res) => {
  const parsed = appFormSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  
  const created = await prisma.applicationForm.create({ data: parsed.data });

  // Generar PDF y enviar email a gerencia con el PDF adjunto
  try {
    const pdfStream = PDFService.generateApplicationFormPDF({
      id: created.id,
      nombres: created.nombres,
      apellidos: created.apellidos,
      identificacion: created.identificacion,
      direccion: created.direccion || undefined,
      telefonos: created.telefonos || undefined,
      actividadLaboral: created.actividadLaboral || undefined,
      parejaNombre: created.parejaNombre || undefined,
      hijos: created.hijos || undefined,
      vehiculoMarca: created.vehiculoMarca || undefined,
      vehiculoReferencia: created.vehiculoReferencia || undefined,
      vehiculoPlaca: created.vehiculoPlaca || undefined,
      certificacionTexto: created.certificacionTexto || undefined,
      fechaCreacion: created.fechaCreacion,
    });

    // Convertir stream a buffer
    const chunks: Buffer[] = [];
    pdfStream.on('data', (chunk) => chunks.push(chunk));
    pdfStream.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      
      // Enviar email a gerencia con PDF adjunto
      await EmailService.sendApplicationToManagement(
        {
          nombres: created.nombres,
          apellidos: created.apellidos,
          identificacion: created.identificacion,
        },
        pdfBuffer
      );

      // Enviar email de confirmación al aspirante (si proporcionó correo)
      if (parsed.data.correo) {
        await EmailService.sendApplicationConfirmation(
          parsed.data.correo,
          `${created.nombres} ${created.apellidos}`
        );
      }
    });
  } catch (error) {
    console.error('Error enviando emails:', error);
    // No fallar la petición aunque falle el email
  }

  res.json({ status: 'ok', data: created, message: 'Formulario recibido. Te contactaremos pronto.' });
});

router.get('/', requireAuth, requireAdminRole, async (_req, res) => {
  const forms = await prisma.applicationForm.findMany({ orderBy: { fechaCreacion: 'desc' } });
  res.json({ status: 'ok', data: forms });
});

router.get('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const form = await prisma.applicationForm.findUnique({ where: { id: req.params.id } });
  if (!form) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: form });
});

/**
 * Endpoint para generar y descargar PDF del formulario de inscripción.
 * Protegido con autenticación y rol admin.
 */
router.get('/:id/pdf', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const form = await prisma.applicationForm.findUnique({ where: { id: req.params.id } });
    if (!form) return res.status(404).json({ status: 'error', message: 'Formulario no encontrado' });

    const pdfStream = PDFService.generateApplicationFormPDF({
      id: form.id,
      nombres: form.nombres,
      apellidos: form.apellidos,
      identificacion: form.identificacion,
      direccion: form.direccion || undefined,
      telefonos: form.telefonos || undefined,
      actividadLaboral: form.actividadLaboral || undefined,
      parejaNombre: form.parejaNombre || undefined,
      hijos: form.hijos || undefined,
      vehiculoMarca: form.vehiculoMarca || undefined,
      vehiculoReferencia: form.vehiculoReferencia || undefined,
      vehiculoPlaca: form.vehiculoPlaca || undefined,
      certificacionTexto: form.certificacionTexto || undefined,
      fechaCreacion: form.fechaCreacion,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="formulario-${form.identificacion}.pdf"`);
    pdfStream.pipe(res);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ status: 'error', message: 'Error generando PDF' });
  }
});

export default router;
