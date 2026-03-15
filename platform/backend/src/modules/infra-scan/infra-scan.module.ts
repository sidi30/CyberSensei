import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraScanService } from './infra-scan.service';
import { InfraScanController } from './infra-scan.controller';
import { ScanHistory } from '../../entities/scan-history.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ScanHistory]),
  ],
  controllers: [InfraScanController],
  providers: [InfraScanService],
  exports: [InfraScanService],
})
export class InfraScanModule {}
