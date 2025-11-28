import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const newsSchema = z.object({
  titulo: z.string().min(3),
  resumen: z.string().optional(),
  contenido: z.string().min(10),
  imagenUrl: z.string().url().optional(),
  autorId: z.string().uuid().optional(),
});

router.get('/', async (_req, res) => {
  const news = await prisma.news.findMany({ include: { autor: true }, orderBy: { fechaPublicacion: 'desc' } });
  res.json({ status: 'ok', data: news });
});

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = newsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.news.create({ data: parsed.data });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', async (req, res) => {
  const item = await prisma.news.findUnique({ where: { id: req.params.id }, include: { autor: true } });
  if (!item) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: item });
});

router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = newsSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const updated = await prisma.news.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.news.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
