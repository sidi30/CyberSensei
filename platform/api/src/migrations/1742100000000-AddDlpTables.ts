import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDlpTables1742100000000 implements MigrationInterface {
  name = 'AddDlpTables1742100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "dlp_risk_level_enum" AS ENUM ('SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "dlp_ai_tool_enum" AS ENUM ('CHATGPT', 'GEMINI', 'CLAUDE', 'COPILOT', 'MISTRAL');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "dlp_alert_severity_enum" AS ENUM ('HIGH', 'CRITICAL');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "dlp_alert_status_enum" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "dlp_sensitive_data_category_enum" AS ENUM (
          'PERSONAL_DATA', 'COMPANY_CONFIDENTIAL', 'CLIENT_INFORMATION',
          'SOURCE_CODE', 'CREDENTIALS_SECRETS', 'FINANCIAL_DATA',
          'LEGAL_DOCUMENTS', 'MEDICAL_DATA', 'INTELLECTUAL_PROPERTY',
          'HEALTH_DATA', 'POLITICAL_OPINION', 'UNION_MEMBERSHIP',
          'RELIGIOUS_BELIEF', 'SEXUAL_ORIENTATION', 'ETHNIC_ORIGIN',
          'BIOMETRIC_DATA', 'CRIMINAL_DATA'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // DLP Prompt Events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dlp_prompt_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "userId" varchar NOT NULL,
        "promptHash" varchar(64) NOT NULL,
        "riskScore" int NOT NULL DEFAULT 0,
        "riskLevel" "dlp_risk_level_enum" NOT NULL DEFAULT 'SAFE',
        "aiTool" "dlp_ai_tool_enum",
        "blocked" boolean NOT NULL DEFAULT false,
        "sourceUrl" text,
        "containsArticle9" boolean NOT NULL DEFAULT false,
        "retentionExpiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dlp_prompt_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dlp_prompt_events_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_dlp_prompt_events_tenant_created" ON "dlp_prompt_events" ("tenantId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_dlp_prompt_events_user_created" ON "dlp_prompt_events" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_dlp_prompt_events_risk_level" ON "dlp_prompt_events" ("riskLevel")`);

    // DLP Risk Detections
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dlp_risk_detections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "promptEventId" uuid NOT NULL,
        "category" "dlp_sensitive_data_category_enum" NOT NULL,
        "confidence" float NOT NULL DEFAULT 0,
        "method" varchar,
        "snippetRedacted" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dlp_risk_detections" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dlp_risk_detections_event" FOREIGN KEY ("promptEventId")
          REFERENCES "dlp_prompt_events"("id") ON DELETE CASCADE
      )
    `);

    // DLP Alerts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dlp_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text,
        "severity" "dlp_alert_severity_enum" NOT NULL,
        "status" "dlp_alert_status_enum" NOT NULL DEFAULT 'OPEN',
        "promptEventId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "resolvedAt" TIMESTAMP,
        CONSTRAINT "PK_dlp_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dlp_alerts_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_dlp_alerts_tenant_status_created" ON "dlp_alerts" ("tenantId", "status", "createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "dlp_alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dlp_risk_detections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dlp_prompt_events"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dlp_alert_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dlp_alert_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dlp_sensitive_data_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dlp_ai_tool_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dlp_risk_level_enum"`);
  }
}
