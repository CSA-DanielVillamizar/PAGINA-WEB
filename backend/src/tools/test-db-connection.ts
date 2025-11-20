/**
 * test-db-connection.ts
 * Script de verificación rápida de la conexión a PostgreSQL usando las variables de entorno actuales.
 * Ejecutar después de definir: DB_HOST, DB_PORT, DB_USER, DB_PASS (o referencia Key Vault resuelta), DB_NAME.
 * Uso local (PowerShell):
 *   $env:DB_HOST="localhost"; $env:DB_PORT="5432"; $env:DB_USER="pgadmin"; $env:DB_PASS="<pwd>"; $env:DB_NAME="lama_db"; npm run build && node dist/src/tools/test-db-connection.js
 */
import { Client } from 'pg'

async function main() {
  const start = Date.now()
  const host = process.env.DB_HOST
  const port = parseInt(process.env.DB_PORT || '5432')
  const userRaw = process.env.DB_USER
  const passRaw = process.env.DB_PASS
  const db = process.env.DB_NAME

  if (!host || !userRaw || !passRaw || !db) {
    console.error('[DB Test] Faltan variables requeridas. Defina DB_HOST, DB_USER, DB_PASS, DB_NAME.')
    process.exit(2)
  }

  const user = userRaw.includes('@') ? userRaw.split('@')[0] : userRaw // Normalización Flexible Server
  const keyVaultUnresolved = /@Microsoft\.KeyVault\(/i.test(passRaw)
  if (keyVaultUnresolved) {
    console.warn('[DB Test] La referencia de Key Vault para DB_PASS no se resolvió todavía. La conexión fallará.')
  }

  const client = new Client({
    host,
    port,
    user,
    password: passRaw,
    database: db,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    console.log('[DB Test] Intentando conexión...', { host, port, user, db, kvResolved: !keyVaultUnresolved })
    await client.connect()
    const res = await client.query('SELECT version();')
    console.log('[DB Test] Conexión EXITOSA. Version:', res.rows[0].version)
    const elapsed = Date.now() - start
    console.log(`[DB Test] Tiempo total: ${elapsed}ms`)
    process.exit(0)
  } catch (err: any) {
    console.error('[DB Test] ERROR de conexión:', err.message)
    process.exit(1)
  } finally {
    try { await client.end() } catch {}
  }
}

main()
