import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth, requireRoles } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const userSchema = z.object({
  nombreCompleto: z.string().min(3),
  correo: z.string().email(),
  nombreUsuario: z.string().min(3),
  telefono: z.string().optional(),
  genero: z.string().optional(),
  capitulo: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
});

router.get('/', requireAuth, requireAdminRole, async (_req, res) => {
  const users = await prisma.user.findMany({ include: { roles: { include: { role: true } }, perfil: true } });
  res.json({ status: 'ok', data: users });
});

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const data = parsed.data;
  const created = await prisma.user.create({ data });
  res.json({ status: 'ok', data: created });
});

router.get('/:id', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { roles: { include: { role: true } }, perfil: true } });
  if (!user) return res.status(404).json({ status: 'error', message: 'No encontrado' });
  res.json({ status: 'ok', data: user });
});

router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const parsed = userSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ status: 'ok', data: updated });
});

router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ status: 'ok' });
});

export default router;
