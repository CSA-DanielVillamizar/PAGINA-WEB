import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

/**
 * Migración: VehicleEnhancements
 * Agrega campos para soporte de propiedad, historial y galería de imágenes en vehículos.
 * Nuevos campos:
 * - ownerUserId: UUID opcional del miembro propietario actual.
 * - ownershipHistory: JSONB para rastrear eventos de transferencia.
 * - images: JSONB array de URLs de imágenes adicionales.
 */
export class VehicleEnhancements1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna ownerUserId
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'ownerUserId',
        type: 'uuid',
        isNullable: true,
      })
    )

    // Agregar columna ownershipHistory (JSONB)
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'ownershipHistory',
        type: 'jsonb',
        isNullable: true,
      })
    )

    // Agregar columna images (JSONB array)
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'images',
        type: 'jsonb',
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles', 'images')
    await queryRunner.dropColumn('vehicles', 'ownershipHistory')
    await queryRunner.dropColumn('vehicles', 'ownerUserId')
  }
}
