import { Router } from 'express';
import { prisma } from '../../utils/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import crypto from 'crypto';

const router = Router();

const emailInstitucional = /@fundacionlamamedellin\.org$/i;

const registroSchema = z.object({
  nombreCompleto: z.string().min(3),
  correo: z.string().email(),
  nombreUsuario: z.string().min(3),
  password: z.string().min(8),
});

router.post('/registro', async (req, res) => {
  const parsed = registroSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const { nombreCompleto, correo, nombreUsuario, password } = parsed.data;

  const existe = await prisma.user.findFirst({ where: { OR: [{ correo }, { nombreUsuario }] } });
  if (existe) return res.status(409).json({ status: 'error', message: 'Usuario o correo ya existe' });

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nombreCompleto,
      correo,
      nombreUsuario,
      // roles: Invitado por defecto
      roles: { create: [{ role: { connect: { nombre: 'Invitado' } } }] },
    },
  });

  // Guardar hash en una tabla separada si se desea; aquí por simplicidad lo omitimos.
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: `hash:${hash}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: true,
    },
  });

  return res.json({ status: 'ok', data: { id: user.id } });
});

const loginSchema = z.object({
  correo: z.string().email().optional(),
  nombreUsuario: z.string().optional(),
  password: z.string().min(8),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const { correo, nombreUsuario, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ correo: correo ?? '' }, { nombreUsuario: nombreUsuario ?? '' }] },
    include: { roles: { include: { role: true } } },
  });
  if (!user) return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });

  const pwdRow = await prisma.passwordResetToken.findFirst({ where: { userId: user.id, used: true } });
  const ok = pwdRow?.token?.startsWith('hash:') ? await bcrypt.compare(password, pwdRow.token.substring(5)) : false;
  if (!ok) return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });

  const roles = user.roles.map((r) => r.role.nombre);

  const access = jwt.sign({ sub: user.id, roles, email: user.correo }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refresh = jwt.sign({ sub: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

  return res.json({ status: 'ok', data: { access, refresh } });
});

const refreshSchema = z.object({ refresh: z.string() });
router.post('/refresh', (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  try {
    const payload = jwt.verify(parsed.data.refresh, config.jwt.refreshSecret) as any;
    return res.json({ status: 'ok', data: { access: jwt.sign({ sub: payload.sub }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn }) } });
  } catch {
    return res.status(401).json({ status: 'error', message: 'Refresh token inválido' });
  }
});

const resetRequestSchema = z.object({ correo: z.string().email() });
router.post('/password/reset/request', async (req, res) => {
  const parsed = resetRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const { correo } = parsed.data;

  const user = await prisma.user.findUnique({ where: { correo } });
  if (!user) return res.json({ status: 'ok' }); // no filtrar existencia

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
  // TODO: enviar correo con link
  return res.json({ status: 'ok' });
});

const resetConfirmSchema = z.object({ token: z.string(), password: z.string().min(8) });
router.post('/password/reset/confirm', async (req, res) => {
  const parsed = resetConfirmSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ status: 'error', message: parsed.error.flatten() });
  const { token, password } = parsed.data;

  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.used || row.expiresAt < new Date()) return res.status(400).json({ status: 'error', message: 'Token inválido' });

  const hash = await bcrypt.hash(password, 10);
  await prisma.passwordResetToken.update({ where: { id: row.id }, data: { used: true } });
  await prisma.passwordResetToken.create({ data: { userId: row.userId, token: `hash:${hash}`, expiresAt: new Date(), used: true } });
  return res.json({ status: 'ok' });
});

export default router;
