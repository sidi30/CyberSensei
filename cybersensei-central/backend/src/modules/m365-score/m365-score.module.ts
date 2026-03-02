import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Score } from '../../entities/m365-score.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365ScoreController } from './m365-score.controller';
import { M365ScoreService } from './m365-score.service';

@Module({
  imports: [TypeOrmModule.forFeature([M365Score, M365Finding])],
  controllers: [M365ScoreController],
  providers: [M365ScoreService],
  exports: [M365ScoreService],
})
export class M365ScoreModule {}
