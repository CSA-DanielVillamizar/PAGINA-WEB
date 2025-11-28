import { Request, Response, NextFunction } from 'express';
import { JwtPayloadCustom } from './auth';

/**
 * Roles permitidos para acceder al panel de administración completo.
 */
const ADMIN_ROLES = [
  'Presidente',
  'Vicepresidente',
  'Secretario',
  'Tesorero',
  'Administrador',
  'GerenciaNegocios',
  'CommunityManager',
  'MTO'
];

/**
 * Middleware de autorización para rutas de administración.
 * Solo permite acceso a usuarios con roles administrativos.
 * Uso: router.use(requireAdminRole)
 */
export function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as JwtPayloadCustom | undefined;
  
  if (!user) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'No autenticado. Por favor, inicia sesión.' 
    });
  }
  
  const hasAdminRole = user.roles.some((role) => ADMIN_ROLES.includes(role));
  
  if (!hasAdminRole) {
    return res.status(403).json({ 
      status: 'error', 
      message: 'No tienes permisos para acceder a esta área administrativa. Contacta con la Junta Directiva.' 
    });
  }
  
  next();
}

/**
 * Verifica si un usuario tiene rol administrativo.
 * Útil para validaciones en lógica de negocio.
 */
export function isAdminRole(roles: string[]): boolean {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}
