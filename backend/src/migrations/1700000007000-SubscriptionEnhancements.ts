import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class SubscriptionEnhancements1700000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'subscriptions',
      new TableColumn({
        name: 'confirmToken',
        type: 'uuid',
        isNullable: true,
        isUnique: true,
        comment: 'Token único para confirmación de email'
      })
    )

    await queryRunner.addColumn(
      'subscriptions',
      new TableColumn({
        name: 'unsubscribeToken',
        type: 'uuid',
        isNullable: true,
        isUnique: true,
        comment: 'Token único para desuscripción directa sin login'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('subscriptions', 'unsubscribeToken')
    await queryRunner.dropColumn('subscriptions', 'confirmToken')
  }
}
