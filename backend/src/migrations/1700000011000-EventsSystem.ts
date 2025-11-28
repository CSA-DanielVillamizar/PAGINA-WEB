import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migración: Sistema completo de eventos
 * Crea tablas events y event_participants con todas las relaciones
 */
export class EventsSystem1700000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla events
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '200'
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '250',
            isUnique: true
          },
          {
            name: 'descripcionLarga',
            type: 'text'
          },
          {
            name: 'fechaInicio',
            type: 'timestamp'
          },
          {
            name: 'fechaFin',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'horaEncuentro',
            type: 'time',
            isNullable: true
          },
          {
            name: 'horaSalida',
            type: 'time',
            isNullable: true
          },
          {
            name: 'destino',
            type: 'varchar',
            length: '200'
          },
          {
            name: 'puntoEncuentro',
            type: 'varchar',
            length: '300',
            isNullable: true
          },
          {
            name: 'tipoActividad',
            type: 'enum',
            enum: [
              'RODADA',
              'ASAMBLEA',
              'ANIVERSARIO',
              'RALLY_NACIONAL',
              'RALLY_REGIONAL',
              'RALLY_SUDAMERICANO',
              'RALLY_INTERNACIONAL',
              'LAMA_HIERRO',
              'EVENTO_SOCIAL',
              'RUTA_ICONICA',
              'OTRO'
            ],
            default: "'RODADA'"
          },
          {
            name: 'dificultad',
            type: 'enum',
            enum: ['BAJA', 'MEDIA', 'ALTA'],
            default: "'MEDIA'"
          },
          {
            name: 'duracionHoras',
            type: 'int',
            default: 2
          },
          {
            name: 'organizador',
            type: 'varchar',
            length: '200',
            default: "'Fundación L.A.M.A. Medellín'"
          },
          {
            name: 'kilometraje',
            type: 'int',
            default: 0
          },
          {
            name: 'linkTerminos',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'estado',
            type: 'enum',
            enum: ['BORRADOR', 'PUBLICADO', 'CANCELADO', 'FINALIZADO'],
            default: "'BORRADOR'"
          },
          {
            name: 'imagenUrl',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true
    );

    // Crear índices para events
    await queryRunner.query(`CREATE INDEX idx_events_slug ON events(slug)`);
    await queryRunner.query(`CREATE INDEX idx_events_tipo ON events("tipoActividad")`);
    await queryRunner.query(`CREATE INDEX idx_events_estado ON events(estado)`);
    await queryRunner.query(`CREATE INDEX idx_events_fecha_inicio ON events("fechaInicio")`);

    // Crear tabla event_participants
    await queryRunner.createTable(
      new Table({
        name: 'event_participants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'eventId',
            type: 'uuid'
          },
          {
            name: 'userId',
            type: 'uuid'
          },
          {
            name: 'fechaRegistro',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'fuente',
            type: 'enum',
            enum: ['WEB', 'APP', 'ADMIN'],
            default: "'WEB'"
          },
          {
            name: 'estado',
            type: 'enum',
            enum: ['REGISTRADO', 'CONFIRMADO', 'ASISTIO', 'NO_ASISTIO'],
            default: "'REGISTRADO'"
          },
          {
            name: 'notas',
            type: 'text',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'event_participants',
      new TableForeignKey({
        columnNames: ['eventId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'events',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'event_participants',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );

    // Crear índices para event_participants
    await queryRunner.query(`CREATE INDEX idx_participants_event ON event_participants("eventId")`);
    await queryRunner.query(`CREATE INDEX idx_participants_user ON event_participants("userId")`);
    await queryRunner.query(`CREATE INDEX idx_participants_estado ON event_participants(estado)`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_participants_unique ON event_participants("eventId", "userId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    const participantsTable = await queryRunner.getTable('event_participants');
    if (participantsTable) {
      const eventForeignKey = participantsTable.foreignKeys.find(fk => fk.columnNames.indexOf('eventId') !== -1);
      const userForeignKey = participantsTable.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
      if (eventForeignKey) {
        await queryRunner.dropForeignKey('event_participants', eventForeignKey);
      }
      if (userForeignKey) {
        await queryRunner.dropForeignKey('event_participants', userForeignKey);
      }
    }

    // Eliminar tablas
    await queryRunner.dropTable('event_participants', true);
    await queryRunner.dropTable('events', true);
  }
}
