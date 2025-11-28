import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { requireAuth } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';
import { z } from 'zod';

const router = Router();

const donationSchema = z.object({
  nombreDonante: z.string().min(3),
  correo: z.string().email().optional(),
  monto: z.number().positive(),
  mensajeOpcional: z.string().optional(),
});

router.post('/', async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const created = await prisma.donation.create({ data: parsed.data });
  res.json({ status: 'ok', data: created, message: 'Gracias por tu donación' });
});

router.get('/', requireAuth, requireAdminRole, async (_req, res) => {
  const donations = await prisma.donation.findMany({ orderBy: { fecha: 'desc' } });
  res.json({ status: 'ok', data: donations });
});

export default router;
