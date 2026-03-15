import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NIS2DiagnosticResult } from '../../entities/nis2-diagnostic-result.entity';
import { NIS2DiagnosticService } from './nis2-diagnostic.service';
import { NIS2DiagnosticController } from './nis2-diagnostic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NIS2DiagnosticResult])],
  controllers: [NIS2DiagnosticController],
  providers: [NIS2DiagnosticService],
  exports: [NIS2DiagnosticService],
})
export class NIS2DiagnosticModule {}
