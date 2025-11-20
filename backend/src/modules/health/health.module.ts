import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'

/**
 * Módulo de salud del sistema.
 * Encapsula el controlador de salud para mantener separación de responsabilidades.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
