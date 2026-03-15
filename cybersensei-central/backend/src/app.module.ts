import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TenantModule } from './modules/tenant/tenant.module';
import { LicenseModule } from './modules/license/license.module';
import { UpdateModule } from './modules/update/update.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { GlobalMetricsModule } from './modules/global-metrics/global-metrics.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { AiModule } from './modules/ai/ai.module';
import { M365AuthModule } from './modules/m365-auth/m365-auth.module';
import { M365ScanModule } from './modules/m365-scan/m365-scan.module';
import { M365ScoreModule } from './modules/m365-score/m365-score.module';
import { M365ReportModule } from './modules/m365-report/m365-report.module';
import { M365AlertModule } from './modules/m365-alert/m365-alert.module';
import { M365SchedulerModule } from './modules/m365-scheduler/m365-scheduler.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AiExerciseModule } from './modules/ai-exercise/ai-exercise.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { EmailModule } from './modules/email/email.module';
import { M365DiagnosticModule } from './modules/m365-diagnostic/m365-diagnostic.module';
import { NIS2DiagnosticModule } from './modules/nis2-diagnostic/nis2-diagnostic.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ExtensionModule } from './modules/extension/extension.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ScanSchedulerModule } from './modules/scheduler/scheduler.module';
import { MetricsMiddleware } from './common/middleware/metrics.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - 60 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // Scheduler
    ScheduleModule.forRoot(),

    // PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production' ? ['error', 'warn'] : ['error'],
      }),
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),

    // Application modules
    TenantModule,
    LicenseModule,
    UpdateModule,
    TelemetryModule,
    AdminAuthModule,
    GlobalMetricsModule,
    ExerciseModule,

    // M365 Monitoring modules
    AiModule,
    M365AuthModule,
    M365ScanModule,
    M365ScoreModule,
    M365ReportModule,
    M365AlertModule,
    M365SchedulerModule,
    HealthModule,
    MetricsModule,
    AiExerciseModule,
    SubscriptionModule,
    EmailModule,

    // Free diagnostic tools (public endpoints)
    M365DiagnosticModule,
    NIS2DiagnosticModule,
    ComplianceModule,

    // Billing
    StripeModule,

    // Scan Scheduler & Alert Pipeline
    ScanSchedulerModule,

    // Chrome/Edge Extension API
    ExtensionModule,
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
