/**
 * Wrapper opcional para ejecutar migraciones sobre un DataSource ya inicializado.
 * Se separa del runner original para evitar dependencias circulares y facilitar lazy init.
 */
import { DataSource } from 'typeorm'

export async function runMigrations(dataSource: DataSource) {
  if (!dataSource.isInitialized) {
    throw new Error('DataSource no inicializado')
  }
  // El proyecto ya cuenta con `migrations-runner.ts`; aquí podrías reutilizar lógica
  // o directamente invocar dataSource.runMigrations().
  await dataSource.runMigrations({ transaction: 'all' })
}
