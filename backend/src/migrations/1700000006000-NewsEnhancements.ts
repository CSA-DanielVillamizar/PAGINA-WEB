import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class NewsEnhancements1700000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'news',
      new TableColumn({
        name: 'featuredImageUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL de la imagen destacada del artículo'
      })
    )

    await queryRunner.addColumn(
      'news',
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        isNullable: true,
        default: "'[]'",
        comment: 'Array de etiquetas para categorización y filtrado'
      })
    )

    await queryRunner.addColumn(
      'news',
      new TableColumn({
        name: 'viewCount',
        type: 'int',
        default: 0,
        comment: 'Contador de visualizaciones del artículo'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('news', 'viewCount')
    await queryRunner.dropColumn('news', 'tags')
    await queryRunner.dropColumn('news', 'featuredImageUrl')
  }
}
