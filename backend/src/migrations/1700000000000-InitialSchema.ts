import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

/**
 * Migración inicial del esquema.
 * Crea tablas base para usuarios, roles, perfiles, eventos, donaciones, noticias,
 * souvenirs, suscripciones, vehículos, formularios y galerías.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // users
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'nombreCompleto', type: 'varchar' },
        { name: 'correo', type: 'varchar', isUnique: true },
        { name: 'passwordHash', type: 'varchar', isNullable: true },
        { name: 'estado', type: 'varchar', default: `'ACTIVE'` },
        { name: 'usuario', type: 'varchar', isNullable: true },
        { name: 'telefono', type: 'varchar', isNullable: true },
        { name: 'genero', type: 'varchar', isNullable: true },
        { name: 'capitulo', type: 'varchar', isNullable: true },
        { name: 'fechaRegistro', type: 'timestamptz', default: 'now()' }
      ]
    }))

    // roles
    await queryRunner.createTable(new Table({
      name: 'roles',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'name', type: 'varchar', isUnique: true },
        { name: 'description', type: 'varchar', isNullable: true }
      ]
    }))

    // user_roles join table
    await queryRunner.createTable(new Table({
      name: 'user_roles',
      columns: [
        { name: 'user_id', type: 'uuid', isPrimary: false, isNullable: false },
        { name: 'role_id', type: 'uuid', isPrimary: false, isNullable: false }
      ],
      uniques: [{ name: 'UQ_user_role', columnNames: ['user_id', 'role_id'] }]
    }))
    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }))
    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['role_id'],
      referencedTableName: 'roles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }))

    // member_profiles
    await queryRunner.createTable(new Table({
      name: 'member_profiles',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'userId', type: 'uuid', isUnique: true },
        { name: 'membershipNumber', type: 'varchar', length: '100', isNullable: true },
        { name: 'chapter', type: 'varchar', length: '100', isNullable: true },
        { name: 'membershipType', type: 'varchar', length: '50', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'active'` },
        { name: 'memberSince', type: 'timestamptz', isNullable: true },
        { name: 'renewalDate', type: 'timestamptz', isNullable: true },
        { name: 'bio', type: 'text', isNullable: true },
        { name: 'socialLinks', type: 'jsonb', isNullable: true },
        { name: 'profileImageUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))
    await queryRunner.createForeignKey('member_profiles', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }))

    // events
    await queryRunner.createTable(new Table({
      name: 'events',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'title', type: 'varchar', length: '255' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'eventDate', type: 'timestamptz' },
        { name: 'location', type: 'varchar', length: '255', isNullable: true },
        { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'upcoming'` },
        { name: 'capacity', type: 'int', default: '0' },
        { name: 'registeredCount', type: 'int', default: '0' },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))

    // donations
    await queryRunner.createTable(new Table({
      name: 'donations',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
        { name: 'currency', type: 'varchar', length: '50' },
        { name: 'paymentMethod', type: 'varchar', length: '100', isNullable: true },
        { name: 'description', type: 'varchar', length: '255', isNullable: true },
        { name: 'transactionId', type: 'varchar', length: '100', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'completed'` },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'userId', type: 'uuid', isNullable: true }
      ]
    }))
    await queryRunner.createForeignKey('donations', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL'
    }))

    // news
    await queryRunner.createTable(new Table({
      name: 'news',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'title', type: 'varchar', length: '255' },
        { name: 'content', type: 'text' },
        { name: 'excerpt', type: 'text', isNullable: true },
        { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'category', type: 'varchar', length: '100', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'draft'` },
        { name: 'publishedAt', type: 'timestamptz', isNullable: true },
        { name: 'authorId', type: 'uuid', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))
    await queryRunner.createForeignKey('news', new TableForeignKey({
      columnNames: ['authorId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL'
    }))

    // souvenirs
    await queryRunner.createTable(new Table({
      name: 'souvenirs',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'name', type: 'varchar', length: '255' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'price', type: 'decimal', precision: 10, scale: 2 },
        { name: 'currency', type: 'varchar', length: '50', default: `'USD'` },
        { name: 'stock', type: 'int', default: '0' },
        { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'category', type: 'varchar', length: '100', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'available'` },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))

    // subscriptions
    await queryRunner.createTable(new Table({
      name: 'subscriptions',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'email', type: 'varchar', length: '255' },
        { name: 'name', type: 'varchar', length: '100', isNullable: true },
        { name: 'type', type: 'varchar', length: '100', default: `'newsletter'` },
        { name: 'status', type: 'varchar', length: '50', default: `'active'` },
        { name: 'confirmedAt', type: 'timestamptz', isNullable: true },
        { name: 'unsubscribedAt', type: 'timestamptz', isNullable: true },
        { name: 'userId', type: 'uuid', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))
    await queryRunner.createForeignKey('subscriptions', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL'
    }))

    // vehicles
    await queryRunner.createTable(new Table({
      name: 'vehicles',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'brand', type: 'varchar', length: '100' },
        { name: 'model', type: 'varchar', length: '100' },
        { name: 'year', type: 'int' },
        { name: 'licensePlate', type: 'varchar', length: '50', isUnique: true },
        { name: 'vin', type: 'varchar', length: '100', isNullable: true },
        { name: 'color', type: 'varchar', length: '50', isNullable: true },
        { name: 'status', type: 'varchar', length: '100', default: `'active'` },
        { name: 'notes', type: 'text', isNullable: true },
        { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))

    // application_forms
    await queryRunner.createTable(new Table({
      name: 'application_forms',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'fullName', type: 'varchar', length: '255' },
        { name: 'email', type: 'varchar', length: '255' },
        { name: 'phone', type: 'varchar', length: '50', isNullable: true },
        { name: 'formType', type: 'varchar', length: '100' },
        { name: 'formData', type: 'jsonb', isNullable: true },
        { name: 'status', type: 'varchar', length: '50', default: `'pending'` },
        { name: 'notes', type: 'text', isNullable: true },
        { name: 'reviewedAt', type: 'timestamptz', isNullable: true },
        { name: 'documentUrl', type: 'varchar', length: '500', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' }
      ]
    }))

    // gallery_albums
    await queryRunner.createTable(new Table({
      name: 'gallery_albums',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'titulo', type: 'varchar' },
        { name: 'descripcion', type: 'text', isNullable: true },
        { name: 'eventoId', type: 'varchar', isNullable: true },
        { name: 'imagenes', type: 'jsonb', default: `'[]'` },
        { name: 'fecha', type: 'timestamptz' }
      ]
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('gallery_albums')
    await queryRunner.dropTable('application_forms')
    await queryRunner.dropTable('vehicles')
    await queryRunner.dropTable('subscriptions')
    await queryRunner.dropTable('souvenirs')
    await queryRunner.dropTable('news')
    await queryRunner.dropTable('donations')
    await queryRunner.dropTable('events')
    await queryRunner.dropForeignKey('member_profiles', 'member_profiles_userId_fkey')
    await queryRunner.dropTable('member_profiles')
    await queryRunner.dropForeignKey('user_roles', 'user_roles_user_id_fkey')
    await queryRunner.dropForeignKey('user_roles', 'user_roles_role_id_fkey')
    await queryRunner.dropTable('user_roles')
    await queryRunner.dropTable('roles')
    await queryRunner.dropTable('users')
  }
}
