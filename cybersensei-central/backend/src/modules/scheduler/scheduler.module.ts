import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import { SchedulerService } from './scheduler.service';
import { AlertService } from './alert.service';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Tenant, ScanHistory]),
  ],
  providers: [SchedulerService, AlertService, WebhookService],
  exports: [SchedulerService, AlertService],
})
export class ScanSchedulerModule {}
