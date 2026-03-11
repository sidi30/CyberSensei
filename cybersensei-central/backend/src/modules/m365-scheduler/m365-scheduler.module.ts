import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Connection } from '../../entities/m365-connection.entity';
import { M365Scan } from '../../entities/m365-scan.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365ScanModule } from '../m365-scan/m365-scan.module';
import { M365ScoreModule } from '../m365-score/m365-score.module';
import { M365AlertModule } from '../m365-alert/m365-alert.module';
import { M365AuthModule } from '../m365-auth/m365-auth.module';
import { M365SchedulerService } from './m365-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([M365Connection, M365Scan, M365Finding]),
    M365ScanModule,
    M365ScoreModule,
    M365AlertModule,
    M365AuthModule,
  ],
  providers: [M365SchedulerService],
})
export class M365SchedulerModule {}
