/**
 * migrations-runner.ts
 * Runner para ejecutar migraciones TypeORM en entorno producción.
 * Uso: npm run build && npm run migrate
 */
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { AppDataSource } from './data-source';

// Cargar variables de entorno (si se usa dotenv local en dev)
try { require('dotenv').config(); } catch {}

const logger = new Logger('Migrations');

/**
 * Normaliza el username para PostgreSQL Flexible Server.
 * Flexible Server no requiere formato user@server, solo el nombre del usuario.
 */
function normalizeUsername(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const atIndex = raw.indexOf('@');
  return atIndex > 0 ? raw.substring(0, atIndex) : raw;
}

async function run() {
  const start = Date.now();
  const rawUser = process.env.DB_USER;
  const normalizedUser = normalizeUsername(rawUser);

  logger.log('[Migration Runner] Iniciando conexión DB para migraciones...');
  logger.log(`[Migration Runner] DB_USER (raw): ${rawUser}`);
  logger.log(`[Migration Runner] DB_USER (normalized): ${normalizedUser}`);

  // Sobrescribir credenciales en el DataSource antes de inicializar
  (AppDataSource.options as any).username = normalizedUser;
  (AppDataSource.options as any).password = process.env.DB_PASS;
  (AppDataSource.options as any).logging = true; // Mostrar queries durante migración

  try {
    await AppDataSource.initialize();
    logger.log('[Migration Runner] Conexión establecida. Ejecutando migraciones pendientes...');
    await AppDataSource.runMigrations({ transaction: 'all' });
    const elapsed = Date.now() - start;
    logger.log(`[Migration Runner] ✓ Migraciones aplicadas correctamente. Tiempo: ${elapsed}ms`);
    await AppDataSource.destroy();
    logger.log('[Migration Runner] Conexión cerrada.');
  } catch (err) {
    logger.error('[Migration Runner] ✗ Error al ejecutar migraciones:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

run();
