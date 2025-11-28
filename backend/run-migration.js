require('dotenv').config();
const { AppDataSource } = require('./dist/data-source');

async function runMigration() {
  try {
    console.log('Inicializando DataSource...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_NAME:', process.env.DB_NAME);
    await AppDataSource.initialize();
    console.log('DataSource inicializado correctamente');
    
    console.log('Ejecutando migraciones pendientes...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('No hay migraciones pendientes para ejecutar');
    } else {
      console.log(`Se ejecutaron ${migrations.length} migración(es) exitosamente:`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    }
    
    await AppDataSource.destroy();
    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

runMigration();
