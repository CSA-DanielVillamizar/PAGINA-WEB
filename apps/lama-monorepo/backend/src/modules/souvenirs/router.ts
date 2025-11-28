import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const souvenirSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  imagenUrl: z.string().url().optional(),
  inventario: z.number().int().min(0),
  categoria: z.string().min(1),
});

router.get('/', async (_req, res) => {
  const souvenirs = await prisma.souvenir.findMany();
  res.json({ status: 'ok', data: souvenirs });
});

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = souvenirSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.souvenir.create({ data: parsed.data });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', async (req, res) => {
  const souvenir = await prisma.souvenir.findUnique({ where: { id: req.params.id } });
  if (!souvenir) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: souvenir });
});

router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = souvenirSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const updated = await prisma.souvenir.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.souvenir.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
