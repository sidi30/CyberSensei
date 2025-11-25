import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { Tenant } from '../../entities/tenant.entity';
import { License } from '../../entities/license.entity';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMetric, Tenant, License])],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
