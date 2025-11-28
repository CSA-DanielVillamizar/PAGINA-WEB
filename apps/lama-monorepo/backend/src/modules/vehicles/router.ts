import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const vehicleSchema = z.object({
  userId: z.string().uuid(),
  marca: z.string().min(1),
  referencia: z.string().min(1),
  color: z.string().min(1),
  anio: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  placa: z.string().min(1),
  estado: z.enum(['Activo', 'Vendido']).optional(),
});

router.get('/', requireAuth, async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({ include: { user: true } });
  res.json({ status: 'ok', data: vehicles });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.vehicle.create({ data: parsed.data });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', requireAuth, async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!vehicle) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: vehicle });
});

router.put('/:id', requireAuth, async (req, res) => {
  const parsed = vehicleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const updated = await prisma.vehicle.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
