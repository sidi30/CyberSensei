import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Scan } from '../../entities/m365-scan.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365Score } from '../../entities/m365-score.entity';
import { M365Connection } from '../../entities/m365-connection.entity';
import { AiModule } from '../ai/ai.module';
import { M365ScoreModule } from '../m365-score/m365-score.module';
import { M365ReportController } from './m365-report.controller';
import { M365ReportService } from './m365-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([M365Scan, M365Finding, M365Score, M365Connection]),
    AiModule,
    M365ScoreModule,
  ],
  controllers: [M365ReportController],
  providers: [M365ReportService],
  exports: [M365ReportService],
})
export class M365ReportModule {}
