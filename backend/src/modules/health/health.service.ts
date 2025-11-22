import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'

/**
 * Servicio de verificación de salud y readiness.
 * Encapsula lógica para validar dependencias externas críticas.
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)
  private keyVaultClient?: SecretClient

  constructor(private readonly dataSource: DataSource) {
    // Skip Key Vault initialization if DB is disabled (minimal mode)
    if (process.env.DISABLE_DB === '1') {
      this.logger.log('DISABLE_DB=1: Skipping Key Vault initialization')
      return
    }
    
    const keyVaultName = process.env.KEY_VAULT_NAME
    if (keyVaultName) {
      try {
        const credential = new DefaultAzureCredential()
        this.keyVaultClient = new SecretClient(`https://${keyVaultName}.vault.azure.net`, credential)
      } catch (err) {
        this.logger.warn('No se pudo inicializar cliente de Key Vault: ' + (err as Error).message)
      }
    }
  }

  /**
   * Ejecuta los chequeos de readiness (DB y Key Vault).
   * @returns Resultado agregado y estados individuales.
   */
  async readinessChecks() {
    const dbOk = await this.checkDatabase()
    const kvOk = await this.checkKeyVault()
    return {
      overall: dbOk && kvOk,
      database: { status: dbOk ? 'ok' : 'error' },
      keyVault: { status: kvOk ? 'ok' : 'unavailable' }
    }
  }

  /**
   * Verifica conectividad básica con la base de datos ejecutando un query simple.
   */
  private async checkDatabase(): Promise<boolean> {
    if (process.env.DISABLE_DB === '1') {
      return true // Skip DB check when disabled
    }
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize()
      }
      await this.dataSource.query('SELECT 1')
      return true
    } catch (err) {
      this.logger.error('Fallo chequeo DB: ' + (err as Error).message)
      return false
    }
  }

  /**
   * Verifica acceso a Key Vault intentando listar un secreto conocido opcional.
   */
  private async checkKeyVault(): Promise<boolean> {
    if (!this.keyVaultClient) return false
    try {
      // Intento: leer metadatos de un secreto que debería existir (por ejemplo ENTRA-CLIENT-ID)
      const secretName = process.env.ENTRA_CLIENT_ID ? 'ENTRA-CLIENT-ID' : undefined
      if (secretName) {
        await this.keyVaultClient.getSecret(secretName)
      } else {
        // Si no hay variable indicador, al menos lista una operación trivial (no disponible sin nombre)
      }
      return true
    } catch (err) {
      this.logger.warn('Fallo chequeo Key Vault: ' + (err as Error).message)
      return false
    }
  }
}
