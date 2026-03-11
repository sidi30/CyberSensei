import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptions1741700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "plan_type_enum" AS ENUM ('FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE')
    `);

    await queryRunner.query(`
      CREATE TYPE "subscription_status_enum" AS ENUM ('ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'EXPIRED')
    `);

    // Create subscriptions table
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "plan" "plan_type_enum" NOT NULL DEFAULT 'FREE',
        "status" "subscription_status_enum" NOT NULL DEFAULT 'TRIAL',
        "monthlyPrice" decimal(10,2) NOT NULL DEFAULT 0,
        "trialEndsAt" TIMESTAMP,
        "currentPeriodStart" TIMESTAMP,
        "currentPeriodEnd" TIMESTAMP,
        "currentMonthExercises" integer NOT NULL DEFAULT 0,
        "currentMonthPhishing" integer NOT NULL DEFAULT 0,
        "activeUsers" integer NOT NULL DEFAULT 0,
        "usageResetAt" TIMESTAMP,
        "stripeCustomerId" varchar,
        "stripeSubscriptionId" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subscriptions_tenantId" UNIQUE ("tenantId"),
        CONSTRAINT "FK_subscriptions_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    // Indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_subscriptions_plan" ON "subscriptions" ("plan")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status")
    `);

    // Create a FREE subscription for all existing tenants
    await queryRunner.query(`
      INSERT INTO "subscriptions" ("tenantId", "plan", "status", "trialEndsAt")
      SELECT "id", 'FREE', 'ACTIVE', NOW() + INTERVAL '30 days'
      FROM "tenants"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "plan_type_enum"`);
  }
}
