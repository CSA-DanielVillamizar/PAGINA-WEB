/**
 * Script de prueba de conexión a PostgreSQL.
 * Usa las mismas variables de entorno que la aplicación principal.
 */
const { Client } = require('pg');

// Normaliza el usuario (elimina sufijo @servidor si existe)
function normalizeUser(u) {
  if (!u) return 'pgadmin';
  return u.includes('@') ? u.split('@')[0] : u;
}

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: normalizeUser(process.env.DB_USER),
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lama_db',
  ssl: (process.env.NODE_ENV === 'production' || process.env.DB_SSL === '1')
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 10000,
};

console.log('[DB Test] Configuración de conexión:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  ssl: config.ssl,
  passwordSet: !!config.password,
  passwordLength: config.password ? config.password.length : 0,
  passwordPreview: config.password ? config.password.substring(0, 4) + '***' : 'NOT_SET'
});

const client = new Client(config);

async function testConnection() {
  try {
    console.log('[DB Test] Intentando conectar...');
    await client.connect();
    console.log('[DB Test] ✅ Conexión exitosa!');
    
    const result = await client.query('SELECT version()');
    console.log('[DB Test] Versión de PostgreSQL:', result.rows[0].version);
    
    await client.end();
    console.log('[DB Test] Conexión cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('[DB Test] ❌ Error de conexión:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
}

testConnection();
