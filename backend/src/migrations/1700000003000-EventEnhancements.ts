import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

/**
 * Migración: EventEnhancements
 * Agrega campos para gestión avanzada de eventos.
 * Nuevos campos:
 * - coverImageUrl: Imagen de portada principal del evento.
 * - registrations: JSONB array con inscripciones de usuarios.
 * - reminders: JSONB array para registro de recordatorios enviados.
 */
export class EventEnhancements1700000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna coverImageUrl
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'coverImageUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
      })
    )

    // Agregar columna registrations (JSONB array)
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'registrations',
        type: 'jsonb',
        isNullable: true,
      })
    )

    // Agregar columna reminders (JSONB array)
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'reminders',
        type: 'jsonb',
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('events', 'reminders')
    await queryRunner.dropColumn('events', 'registrations')
    await queryRunner.dropColumn('events', 'coverImageUrl')
  }
}
