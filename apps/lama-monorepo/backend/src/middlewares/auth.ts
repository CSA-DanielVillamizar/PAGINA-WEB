import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayloadCustom {
  sub: string; // userId
  roles: string[];
  email: string;
}

/**
 * Middleware de autenticación JWT.
 * Valida el header Authorization: Bearer <token>, decodifica y adjunta el usuario al request.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
  const token = auth.substring('Bearer '.length);
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayloadCustom;
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
}

/**
 * Middleware de autorización por roles.
 * Uso: requireRoles('Administrador', 'Presidente')
 */
export function requireRoles(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayloadCustom | undefined;
    if (!user) return res.status(401).json({ status: 'error', message: 'No autenticado' });
    const ok = user.roles.some((r) => rolesPermitidos.includes(r));
    if (!ok) return res.status(403).json({ status: 'error', message: 'No autorizado' });
    next();
  };
}
