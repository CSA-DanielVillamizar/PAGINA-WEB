import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthService } from './health.service'

/**
 * Controlador de salud del servicio.
 * Provee un endpoint simple para verificación de vida (liveness) y readiness básica.
 * Útil para monitoreo, pruebas de despliegue y chequeos de infraestructura.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  /**
   * Endpoint de verificación de estado.
   * Retorna información mínima para confirmar que el proceso está activo.
   * @returns Objeto con estado, nombre del servicio, marca de tiempo y versión.
   */
  @Get()
  @ApiOperation({ summary: 'Verificar estado del backend' })
  getStatus() {
    return {
      status: 'ok',
      service: 'lama-backend',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0'
    }
  }

  /**
   * Endpoint de readiness.
   * Verifica componentes críticos: conexión a base de datos y acceso a Key Vault.
   * No expone valores sensibles, sólo estados.
   * @returns Objeto con estado global y detalle de subsistemas.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Verificar preparación de dependencias (DB, Key Vault)' })
  async getReadiness() {
    const checks = await this.healthService.readinessChecks()
    return {
      status: checks.overall ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      ...checks
    }
  }
}
