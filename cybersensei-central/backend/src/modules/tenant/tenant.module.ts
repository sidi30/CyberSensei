import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantMetric]),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

