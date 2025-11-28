#!/bin/bash
# Script para ejecutar migraciones en Azure App Service via SSH
# Ejecutar desde Azure Portal → App Service → SSH Console

set -e

echo "🔍 Verificando ubicación actual..."
pwd

echo -e "\n📂 Navegando a /home/site/wwwroot..."
cd /home/site/wwwroot

echo -e "\n✅ Ubicación actual:"
pwd

echo -e "\n📋 Verificando archivos de migración..."
ls -la src/migrations/

echo -e "\n🔧 Verificando variables de entorno de base de datos..."
if [ -z "$DB_HOST" ]; then
  echo "❌ Error: DB_HOST no está configurado"
  exit 1
fi

echo "✅ DB_HOST: $DB_HOST"
echo "✅ DB_NAME: $DB_NAME"
echo "✅ DB_USER: $DB_USER"
echo "✅ DB_PORT: $DB_PORT"

echo -e "\n🗄️ Ejecutando migraciones TypeORM..."
npm run migration:run

echo -e "\n✅ Migraciones completadas exitosamente!"

echo -e "\n📊 Verificando tabla de migraciones..."
node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkMigrations() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    const result = await client.query('SELECT * FROM typeorm_metadata ORDER BY timestamp DESC LIMIT 10');
    console.log('\n📋 Últimas migraciones aplicadas:');
    console.table(result.rows);
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMigrations();
"

echo -e "\n🎉 ¡Todo listo! Backend con migraciones aplicadas correctamente."
