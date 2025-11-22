import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class GalleryEnhancements1700000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
        'gallery_albums',
      new TableColumn({
        name: 'thumbnailUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL de la imagen de portada del álbum'
      })
    )

    await queryRunner.addColumn(
        'gallery_albums',
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        isNullable: true,
        comment: 'Metadatos adicionales: photographer, tags, location'
      })
    )

    // Agregar timestamps si no existen (createdAt y updatedAt ya podrían estar)
    const table = await queryRunner.getTable('gallery_albums')
    
    if (table && !table.findColumnByName('createdAt')) {
      await queryRunner.addColumn(
        'gallery_albums',
        new TableColumn({
          name: 'createdAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP'
        })
      )
    }

    if (table && !table.findColumnByName('updatedAt')) {
      await queryRunner.addColumn(
          'gallery_albums',
        new TableColumn({
          name: 'updatedAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          onUpdate: 'CURRENT_TIMESTAMP'
        })
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('gallery_albums')
    
      if (table && table.findColumnByName('updatedAt')) {
      await queryRunner.dropColumn('gallery_albums', 'updatedAt')
    }
    
      if (table && table.findColumnByName('createdAt')) {
      await queryRunner.dropColumn('gallery_albums', 'createdAt')
    }
    
      await queryRunner.dropColumn('gallery_albums', 'metadata')
      await queryRunner.dropColumn('gallery_albums', 'thumbnailUrl')
  }
}
