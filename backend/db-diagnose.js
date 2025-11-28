/**
 * Script de diagnóstico de conexión PostgreSQL.
 * Intenta abrir una conexión mínima usando los valores de entorno
 * y reporta metadatos detallados del error sin exponer credenciales.
 * Siempre termina con código de salida 0 para no bloquear el startup wrapper.
 */

const { Client } = require('pg')

function redact(v) {
  if (!v) return 'null'
  if (v.length <= 4) return '****'
  return v[0] + '***' + v.slice(-1)
}

async function run() {
  const cfg = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 8000,
  }

  console.log('[DB-DIAG] Iniciando diagnóstico de conexión PostgreSQL...')
  console.log('[DB-DIAG] Parámetros:', {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    database: cfg.database,
    passRedacted: redact(cfg.password || ''),
    ssl: !!cfg.ssl,
    disableDb: process.env.DISABLE_DB,
    nodeEnv: process.env.NODE_ENV,
  })

  if (process.env.DISABLE_DB === '1') {
    console.log('[DB-DIAG] DISABLE_DB=1 -> Se omite diagnóstico.')
    return
  }

  const client = new Client(cfg)
  const start = Date.now()
  try {
    await client.connect()
    const versionRes = await client.query('SELECT version()')
    console.log('[DB-DIAG] ✓ Conexión exitosa. Version:', versionRes?.rows?.[0]?.version)
  } catch (err) {
    console.log('[DB-DIAG] ✗ ERROR de conexión')
    console.log('[DB-DIAG] Tipo:', err.constructor?.name)
    console.log('[DB-DIAG] Código:', err.code)
    console.log('[DB-DIAG] Detalle:', err.detail)
    console.log('[DB-DIAG] Mensaje:', err.message)
    if (err.stack) console.log('[DB-DIAG] Stack:', err.stack)
    try {
      const ownProps = {}
      for (const k of Object.getOwnPropertyNames(err)) ownProps[k] = err[k]
      console.log('[DB-DIAG] Propiedades:', ownProps)
    } catch {}
  } finally {
    try { await client.end() } catch {}
    console.log('[DB-DIAG] Duración ms:', Date.now() - start)
  }
}

run().catch(e => {
  console.log('[DB-DIAG] FATAL:', e?.message)
  if (e?.stack) console.log(e.stack)
})
