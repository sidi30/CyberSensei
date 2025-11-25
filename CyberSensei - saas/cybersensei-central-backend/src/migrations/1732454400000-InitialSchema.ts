import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1732454400000 implements MigrationInterface {
  name = 'InitialSchema1732454400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "admin_role_enum" AS ENUM('SUPERADMIN', 'SUPPORT')
    `);

    await queryRunner.query(`
      CREATE TYPE "license_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING')
    `);

    await queryRunner.query(`
      CREATE TYPE "error_level_enum" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL')
    `);

    await queryRunner.query(`
      CREATE TYPE "error_source_enum" AS ENUM('NODE', 'BACKEND', 'SYSTEM')
    `);

    // Create admin_users table
    await queryRunner.query(`
      CREATE TABLE "admin_users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "passwordHash" varchar NOT NULL,
        "role" admin_role_enum NOT NULL DEFAULT 'SUPPORT',
        "active" boolean NOT NULL DEFAULT true,
        "lastLoginAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "contactEmail" varchar NOT NULL,
        "licenseKey" varchar NOT NULL UNIQUE,
        "active" boolean NOT NULL DEFAULT true,
        "companyName" varchar,
        "address" varchar,
        "phone" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create licenses table
    await queryRunner.query(`
      CREATE TABLE "licenses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" varchar NOT NULL UNIQUE,
        "tenantId" uuid NOT NULL,
        "expiresAt" timestamp,
        "status" license_status_enum NOT NULL DEFAULT 'ACTIVE',
        "usageCount" integer NOT NULL DEFAULT 0,
        "maxUsageCount" integer,
        "notes" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_licenses_tenant" FOREIGN KEY ("tenantId") 
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // Create tenant_metrics table
    await queryRunner.query(`
      CREATE TABLE "tenant_metrics" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "uptime" integer NOT NULL DEFAULT 0,
        "activeUsers" integer NOT NULL DEFAULT 0,
        "exercisesCompletedToday" integer NOT NULL DEFAULT 0,
        "aiLatency" double precision,
        "version" varchar,
        "additionalData" jsonb,
        "timestamp" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tenant_metrics_tenant" FOREIGN KEY ("tenantId") 
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // Create updates_metadata table
    await queryRunner.query(`
      CREATE TABLE "updates_metadata" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "version" varchar NOT NULL UNIQUE,
        "changelog" text NOT NULL,
        "filename" varchar NOT NULL,
        "fileSize" bigint NOT NULL,
        "mongoFileId" varchar NOT NULL,
        "checksum" varchar,
        "active" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create error_logs table
    await queryRunner.query(`
      CREATE TABLE "error_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid,
        "level" error_level_enum NOT NULL DEFAULT 'ERROR',
        "source" error_source_enum NOT NULL DEFAULT 'BACKEND',
        "message" text NOT NULL,
        "stack" text,
        "endpoint" varchar,
        "method" varchar,
        "statusCode" integer,
        "userId" varchar,
        "ipAddress" varchar,
        "userAgent" varchar,
        "metadata" jsonb,
        "context" jsonb,
        "timestamp" timestamp NOT NULL DEFAULT now(),
        "resolved" boolean NOT NULL DEFAULT false,
        "resolvedAt" timestamp,
        "resolvedBy" varchar,
        "resolutionNotes" text
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_metrics_tenant_timestamp" 
      ON "tenant_metrics" ("tenantId", "timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_metrics_timestamp" 
      ON "tenant_metrics" ("timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_error_logs_tenant_timestamp" 
      ON "error_logs" ("tenantId", "timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_error_logs_level_timestamp" 
      ON "error_logs" ("level", "timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_error_logs_source_timestamp" 
      ON "error_logs" ("source", "timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_licenses_tenant" 
      ON "licenses" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_licenses_status" 
      ON "licenses" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_licenses_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_licenses_tenant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_source_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_level_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_logs_tenant_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_metrics_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_metrics_tenant_timestamp"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "error_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "updates_metadata"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_metrics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "licenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "error_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "error_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "license_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_role_enum"`);
  }
}

