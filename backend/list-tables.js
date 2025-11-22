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

client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"))
  .then(result => {
    console.log('\n📋 Tablas existentes en la base de datos:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    console.log(`\nTotal: ${result.rows.length} tablas\n`);
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
