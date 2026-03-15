import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddExtensionAnalytics1742000000000 implements MigrationInterface {
  name = 'AddExtensionAnalytics1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'extension_analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'tenantId', type: 'varchar', default: "'community'" },
          { name: 'mode', type: 'varchar', default: "'community'" },
          { name: 'extensionVersion', type: 'varchar' },
          { name: 'eventName', type: 'varchar' },
          { name: 'eventData', type: 'jsonb', isNullable: true },
          { name: 'eventTimestamp', type: 'bigint' },
          { name: 'sessionId', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'extension_analytics',
      new TableIndex({
        name: 'IDX_ext_analytics_tenant_date',
        columnNames: ['tenantId', 'createdAt'],
      }),
    );
    await queryRunner.createIndex(
      'extension_analytics',
      new TableIndex({
        name: 'IDX_ext_analytics_event_date',
        columnNames: ['eventName', 'createdAt'],
      }),
    );
    await queryRunner.createIndex(
      'extension_analytics',
      new TableIndex({
        name: 'IDX_ext_analytics_mode',
        columnNames: ['mode'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('extension_analytics', 'IDX_ext_analytics_mode');
    await queryRunner.dropIndex('extension_analytics', 'IDX_ext_analytics_event_date');
    await queryRunner.dropIndex('extension_analytics', 'IDX_ext_analytics_tenant_date');
    await queryRunner.dropTable('extension_analytics');
  }
}
