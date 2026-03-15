import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddComplianceSessions1741800000000 implements MigrationInterface {
  name = 'AddComplianceSessions1741800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'compliance_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'companyName',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sector',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'employeeCount',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'answers',
            type: 'jsonb',
          },
          {
            name: 'scoreGlobal',
            type: 'float',
          },
          {
            name: 'niveauGlobal',
            type: 'varchar',
          },
          {
            name: 'scoresParDomaine',
            type: 'jsonb',
          },
          {
            name: 'planAction',
            type: 'jsonb',
          },
          {
            name: 'reportMarkdown',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
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
      true,
    );

    await queryRunner.createIndex(
      'compliance_sessions',
      new TableIndex({
        name: 'IDX_compliance_sessions_companyName',
        columnNames: ['companyName'],
      }),
    );

    await queryRunner.createIndex(
      'compliance_sessions',
      new TableIndex({
        name: 'IDX_compliance_sessions_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'compliance_sessions',
      new TableIndex({
        name: 'IDX_compliance_sessions_createdAt',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'compliance_sessions',
      'IDX_compliance_sessions_createdAt',
    );
    await queryRunner.dropIndex(
      'compliance_sessions',
      'IDX_compliance_sessions_email',
    );
    await queryRunner.dropIndex(
      'compliance_sessions',
      'IDX_compliance_sessions_companyName',
    );
    await queryRunner.dropTable('compliance_sessions');
  }
}
