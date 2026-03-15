import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365DiagnosticSession } from '../../entities/m365-diagnostic-session.entity';
import { M365DiagnosticService } from './m365-diagnostic.service';
import { M365DiagnosticController } from './m365-diagnostic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([M365DiagnosticSession])],
  controllers: [M365DiagnosticController],
  providers: [M365DiagnosticService],
  exports: [M365DiagnosticService],
})
export class M365DiagnosticModule {}
