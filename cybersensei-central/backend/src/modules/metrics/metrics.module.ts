import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { License } from '../../entities/license.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, License, TenantMetric])],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

