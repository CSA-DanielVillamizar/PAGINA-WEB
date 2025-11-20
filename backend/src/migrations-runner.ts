/**
 * migrations-runner.ts
 * Runner para ejecutar migraciones TypeORM en entorno producción.
 * Uso: npm run build && npm run migrate
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

// Cargar variables de entorno (si se usa dotenv local en dev)
try { require('dotenv').config(); } catch {}

const logger = new Logger('Migrations');

// DataSource aislado para migraciones (no depende de Nest AppModule)
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS, // Debe venir de Key Vault reference en App Settings
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === '1' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  migrationsRun: false,
  logging: false,
  entities: [__dirname + '/**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
});

async function run() {
  const start = Date.now();
  logger.log('Iniciando conexión DB para migraciones...');
  try {
    await dataSource.initialize();
    logger.log('Conexión establecida. Ejecutando migraciones pendientes...');
    await dataSource.runMigrations({ transaction: 'all' });
    const elapsed = Date.now() - start;
    logger.log(`Migraciones aplicadas correctamente. Tiempo: ${elapsed}ms`);
    await dataSource.destroy();
    logger.log('Conexión cerrada.');
  } catch (err) {
    logger.error('Error al ejecutar migraciones:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

run();
