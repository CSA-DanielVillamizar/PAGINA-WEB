require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

console.log('Intentando conectar a PostgreSQL Azure...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

client.connect()
  .then(() => {
    console.log('✅ Conexión exitosa!');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('PostgreSQL version:', result.rows[0].version);
    return client.query('SELECT COUNT(*) FROM migrations');
  })
  .then(result => {
    console.log('Migraciones en BD:', result.rows[0].count);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    console.error('Código:', err.code);
    console.error('Stack completo:', err.stack);
    process.exit(1);
  });
