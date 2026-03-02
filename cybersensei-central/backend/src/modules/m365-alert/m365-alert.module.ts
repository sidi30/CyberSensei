import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Alert } from '../../entities/m365-alert.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365Score } from '../../entities/m365-score.entity';
import { Tenant } from '../../entities/tenant.entity';
import { M365AlertController } from './m365-alert.controller';
import { M365AlertService } from './m365-alert.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([M365Alert, M365Finding, M365Score, Tenant]),
  ],
  controllers: [M365AlertController],
  providers: [M365AlertService],
  exports: [M365AlertService],
})
export class M365AlertModule {}
