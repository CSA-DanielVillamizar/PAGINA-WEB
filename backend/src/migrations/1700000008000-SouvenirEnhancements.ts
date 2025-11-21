import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class SouvenirEnhancements1700000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'souvenirs',
      new TableColumn({
        name: 'inventory',
        type: 'jsonb',
        isNullable: true,
        comment: 'Inventario detallado: quantity, reserved, available, lastRestockDate'
      })
    )

    await queryRunner.addColumn(
      'souvenirs',
      new TableColumn({
        name: 'transactions',
        type: 'jsonb',
        default: "'[]'",
        comment: 'Historial de transacciones: date, type, quantity, userId, notes'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('souvenirs', 'transactions')
    await queryRunner.dropColumn('souvenirs', 'inventory')
  }
}
