import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migración: Crear tabla featured_projects
 * Proyectos sociales destacados gestionados por roles de junta
 */
export class FeaturedProjects1700000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'featured_projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nombre',
            type: 'varchar',
          },
          {
            name: 'descripcion',
            type: 'text',
          },
          {
            name: 'tipo',
            type: 'varchar',
            default: "'comunitario'",
            comment: 'Tipo: salud|educacion|comunitario|acompanamiento',
          },
          {
            name: 'estado',
            type: 'varchar',
            default: "'En curso'",
            comment: 'Estado: En curso|Finalizado|Próximo',
          },
          {
            name: 'imagenUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ubicacion',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fechaInicio',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'fechaFin',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'beneficiarios',
            type: 'int',
            default: 0,
          },
          {
            name: 'tags',
            type: 'simple-array',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('featured_projects');
  }
}
