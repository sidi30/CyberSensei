import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMetric])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

