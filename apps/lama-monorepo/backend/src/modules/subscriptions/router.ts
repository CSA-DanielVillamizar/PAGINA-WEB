import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const subscriptionSchema = z.object({
  correo: z.string().email(),
});

router.post('/', async (req, res) => {
  const parsed = subscriptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const existe = await prisma.subscription.findUnique({ where: { correo: parsed.data.correo } });
  if (existe) return res.json({ status: 'ok', message: 'Ya estás suscrito' });
  const created = await prisma.subscription.create({ data: parsed.data });
  res.json({ status: 'ok', data: created });
});

router.get('/', requireAuth, requireAdminRole, async (_req, res) => {
  const subs = await prisma.subscription.findMany({ where: { activo: true } });
  res.json({ status: 'ok', data: subs });
});

export default router;
