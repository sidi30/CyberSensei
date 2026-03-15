import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiExerciseGeneration1741600000000 implements MigrationInterface {
  name = 'AddAiExerciseGeneration1741600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add sector column to tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants" ADD COLUMN "sector" varchar NULL
    `);

    // Create ai_configs table
    await queryRunner.query(`
      CREATE TABLE "ai_configs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "provider" varchar NOT NULL DEFAULT 'OPENAI',
        "encryptedApiKey" varchar NOT NULL,
        "enabled" boolean NOT NULL DEFAULT false,
        "generationFrequency" varchar NOT NULL DEFAULT 'ON_DEMAND',
        "lastGeneratedAt" timestamp NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_ai_configs_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // Add generated_by_ai column to exercises table (if exercises table exists in this DB)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "exercises" ADD COLUMN "generatedByAi" boolean NOT NULL DEFAULT false;
      EXCEPTION WHEN undefined_table THEN NULL; END $$
    `);

    // Add tenant_id column to exercises table
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "exercises" ADD COLUMN "tenantId" uuid NULL;
      EXCEPTION WHEN undefined_table THEN NULL; END $$
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_configs_tenant" ON "ai_configs" ("tenantId")
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE INDEX "IDX_exercises_generated_by_ai" ON "exercises" ("generatedByAi");
      EXCEPTION WHEN undefined_table THEN NULL; END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE INDEX "IDX_exercises_tenant_id" ON "exercises" ("tenantId");
      EXCEPTION WHEN undefined_table THEN NULL; END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_exercises_tenant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_exercises_generated_by_ai"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_configs_tenant"`);

    // Remove columns from exercises
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "tenantId"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "generatedByAi"`);

    // Drop ai_configs table
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_configs"`);

    // Remove sector column from tenants
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "sector"`);
  }
}
