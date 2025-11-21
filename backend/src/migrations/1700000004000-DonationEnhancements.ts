import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class DonationEnhancements1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donations',
      new TableColumn({
        name: 'paymentInfo',
        type: 'jsonb',
        isNullable: true,
        comment: 'Información adicional del pago: gateway, fees, reference, metadata'
      })
    )

    await queryRunner.addColumn(
      'donations',
      new TableColumn({
        name: 'receiptUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL del recibo PDF generado en Azure Blob Storage'
      })
    )

    await queryRunner.addColumn(
      'donations',
      new TableColumn({
        name: 'receiptNumber',
        type: 'varchar',
        length: '100',
        isNullable: true,
        isUnique: true,
        comment: 'Número único de recibo formato REC-YYYYMMDD-XXXX'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donations', 'receiptNumber')
    await queryRunner.dropColumn('donations', 'receiptUrl')
    await queryRunner.dropColumn('donations', 'paymentInfo')
  }
}
