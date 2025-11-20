import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AppDataSource } from '../../data-source';

/**
 * Controlador temporal para ejecutar migraciones manualmente desde HTTP.
 * SOLO para desarrollo - debe ser protegido o removido en producción.
 */
@Controller('admin')
export class MigrationController {
  @Post('run-migrations')
  @HttpCode(HttpStatus.OK)
  async runMigrations() {
    try {
      // Inicializar si no está conectado
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const pendingMigrations = await AppDataSource.showMigrations();
      
      if (!pendingMigrations) {
        return {
          success: true,
          message: 'No pending migrations',
          executed: [],
        };
      }

      const migrations = await AppDataSource.runMigrations({ transaction: 'all' });

      return {
        success: true,
        message: `Executed ${migrations.length} migration(s)`,
        executed: migrations.map(m => m.name),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.stack : undefined,
      };
    }
  }
}
