/**
 * Script manual para inicialización de la conexión y ejecución opcional de migraciones.
 * Uso: npm run build && npm run db:init
 * No se ejecuta en el arranque automático para evitar bloquear el cold start.
 */
import { ensureDatabaseInitialized, getDatabaseStatus, getDatabaseError, AppDataSource } from '../database/database.provider'

async function run() {
  console.log('[db:init] Inicializando DataSource...')
  const start = Date.now()
  await ensureDatabaseInitialized()
  const status = getDatabaseStatus()
  const elapsed = Date.now() - start
  console.log(`[db:init] Estado: ${status} (elapsed ${elapsed}ms)`)    
  if (status === 'error') {
    console.error('[db:init] Error:', getDatabaseError()?.message)
    process.exit(1)
  }
  if (status === 'connected') {
    // Ejecutar migraciones manualmente si se requiere.
    console.log('[db:init] Ejecutando migraciones (manual)...')
    try {
      // Import dinámico del runner compilado.
      const { runMigrations } = await import('./migrations-runner-wrapper')
      await runMigrations(AppDataSource)
      console.log('[db:init] Migraciones completadas.')
    } catch (err) {
      console.warn('[db:init] No se encontró wrapper de migraciones o falló la ejecución:', (err as Error).message)
    }
  }
}

run().catch(err => {
  console.error('[db:init] Fallo inesperado:', err)
  process.exit(1)
})
