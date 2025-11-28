import 'reflect-metadata'
import { DataSource } from 'typeorm'

/**
 * Proveedor único del DataSource de la aplicación.
 * Implementa INITIALIZACIÓN LAZY: no se llama a initialize() durante el bootstrap
 * de NestJS para evitar bloquear el arranque en Azure App Service.
 * Se inicializa después de que el servidor HTTP comienza a escuchar.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lama_db',
  // Patrón de entidades compiladas en dist (producción). En desarrollo se puede ajustar.
  entities: [process.cwd() + '/dist/**/**/*.entity.js'],
  synchronize: false, // Nunca en producción. Migraciones manuales.
  logging: ['error', 'warn'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 2, // Pool mínimo para reducir overhead en cold start
    connectionTimeoutMillis: 30000
  }
})

// Estado interno de la conexión para reportar en health sin bloquear.
let dbError: Error | null = null

/**
 * Inicializa el DataSource si aún no está inicializado.
 * No lanza excepción: captura y almacena el error para health endpoint.
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (process.env.DISABLE_DB === '1') return
  if (AppDataSource.isInitialized) return
  try {
    await AppDataSource.initialize()
  } catch (err) {
    dbError = err as Error
  }
}

/**
 * Obtiene el estado textual de la base de datos para endpoints de salud.
 */
export function getDatabaseStatus(): 'pending' | 'connected' | 'error' {
  if (process.env.DISABLE_DB === '1') return 'pending'
  if (AppDataSource.isInitialized) return 'connected'
  return dbError ? 'error' : 'pending'
}

/**
 * Retorna el último error capturado (si existe) para diagnósticos.
 */
export function getDatabaseError(): Error | null {
  return dbError
}
