import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DlpService } from './dlp.service';
import { DlpController } from './dlp.controller';
import { DlpPromptEvent } from '../../entities/dlp-prompt-event.entity';
import { DlpRiskDetection } from '../../entities/dlp-risk-detection.entity';
import { DlpAlert } from '../../entities/dlp-alert.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DlpPromptEvent, DlpRiskDetection, DlpAlert]),
  ],
  controllers: [DlpController],
  providers: [DlpService],
  exports: [DlpService],
})
export class DlpModule {}
