import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantModule } from './modules/tenant/tenant.module';
import { LicenseModule } from './modules/license/license.module';
import { UpdateModule } from './modules/update/update.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { GlobalMetricsModule } from './modules/global-metrics/global-metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

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
        synchronize: true, // Set to false in production, use migrations
        logging: false,
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
  ],
})
export class AppModule {}

