import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddScanHistory1741900000000 implements MigrationInterface {
  name = 'AddScanHistory1741900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer les enums
    await queryRunner.query(`
      CREATE TYPE "scan_trigger_type_enum" AS ENUM ('SCHEDULED_DAILY', 'SCHEDULED_WEEKLY', 'MANUAL')
    `);
    await queryRunner.query(`
      CREATE TYPE "scan_history_status_enum" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'scan_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'domain',
            type: 'varchar',
          },
          {
            name: 'score',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'previousScore',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'deltaScore',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'scan_history_status_enum',
            default: `'PENDING'`,
          },
          {
            name: 'trigger',
            type: 'scan_trigger_type_enum',
            default: `'SCHEDULED_DAILY'`,
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'newRisks',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'resolvedRisks',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'durationMs',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['tenantId'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'scan_history',
      new TableIndex({
        name: 'IDX_scan_history_tenant_created',
        columnNames: ['tenantId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'scan_history',
      new TableIndex({
        name: 'IDX_scan_history_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('scan_history', 'IDX_scan_history_status');
    await queryRunner.dropIndex(
      'scan_history',
      'IDX_scan_history_tenant_created',
    );
    await queryRunner.dropTable('scan_history');
    await queryRunner.query('DROP TYPE "scan_history_status_enum"');
    await queryRunner.query('DROP TYPE "scan_trigger_type_enum"');
  }
}
