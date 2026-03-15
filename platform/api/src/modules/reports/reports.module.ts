import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ScanHistory } from '../../entities/scan-history.entity';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ScanHistory]),
    AiModule,
    EmailModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
