import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { License } from '../../entities/license.entity';
import { GlobalMetricsController } from './global-metrics.controller';
import { GlobalMetricsService } from './global-metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMetric, License])],
  controllers: [GlobalMetricsController],
  providers: [GlobalMetricsService],
  exports: [GlobalMetricsService],
})
export class GlobalMetricsModule {}

