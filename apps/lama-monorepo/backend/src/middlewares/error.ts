import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de manejo de errores.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error no controlado:', err);
  if (res.headersSent) {
    return;
  }
  const status = err.status ?? 500;
  const message = err.message ?? 'Error interno del servidor';
  res.status(status).json({ status: 'error', message });
}
