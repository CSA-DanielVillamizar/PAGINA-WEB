import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const memberSchema = z.object({
  userId: z.string().uuid(),
  cargoJunta: z.string().optional(),
  tipoMiembro: z.enum(['Prospecto', 'FullColor', 'Dama']),
  profesion: z.string().optional(),
  serviciosOfrecidos: z.string().optional(),
  biografia: z.string().optional(),
  fotoPerfil: z.string().url().optional(),
  fechaIngreso: z.string().datetime().optional(),
});

router.get('/', async (_req, res) => {
  const members = await prisma.memberProfile.findMany({ include: { user: true } });
  res.json({ status: 'ok', data: members });
});

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.memberProfile.create({ data: parsed.data });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', async (req, res) => {
  const member = await prisma.memberProfile.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!member) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: member });
});

router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = memberSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const updated = await prisma.memberProfile.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.memberProfile.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
