import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtensionAnalytics } from '../../entities/extension-analytics.entity';
import { ExtensionAnalyticsController } from './extension-analytics.controller';
import { ExtensionAnalyticsService } from './extension-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExtensionAnalytics])],
  controllers: [ExtensionAnalyticsController],
  providers: [ExtensionAnalyticsService],
  exports: [ExtensionAnalyticsService],
})
export class ExtensionAnalyticsModule {}
