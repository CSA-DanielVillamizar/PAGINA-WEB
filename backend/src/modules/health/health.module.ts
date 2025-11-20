import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'
import { TypeOrmModule } from '@nestjs/typeorm'

/**
 * Módulo de salud del sistema.
 * Encapsula el controlador de salud para mantener separación de responsabilidades.
 */
@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
