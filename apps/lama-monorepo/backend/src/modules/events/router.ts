import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const eventSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  fecha: z.string().datetime(),
  hora: z.string().optional(),
  capitulo: z.string().optional(),
  tipoEvento: z.enum(['Rodada', 'Asamblea', 'AniversarioCapitulos', 'RallyNacional', 'RallyRegional', 'RallySudamericano', 'RallyInternacional', 'LAMAdHierro', 'RutaIconica']),
  ubicacion: z.string().optional(),
  estado: z.enum(['Proximo', 'Sancionado', 'Finalizado']).optional(),
});

router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { fecha: 'asc' } });
  res.json({ status: 'ok', data: events });
});

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.event.create({ data: { ...parsed.data, fecha: new Date(parsed.data.fecha) } });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: event });
});

router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const dataToUpdate = parsed.data.fecha ? { ...parsed.data, fecha: new Date(parsed.data.fecha) } : parsed.data;
  const updated = await prisma.event.update({ where: { id: req.params.id }, data: dataToUpdate });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
