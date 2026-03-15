import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExtensionAnalyticsService } from './extension-analytics.service';

@ApiTags('Extension Analytics')
@Controller('api/extension')
export class ExtensionAnalyticsController {
  constructor(private readonly analyticsService: ExtensionAnalyticsService) {}

  /**
   * POST /api/extension/telemetry
   * Recoit un batch d'events de telemetrie depuis l'extension Chrome.
   * Endpoint public (pas d'auth) car utilise par le mode community.
   */
  @Post('telemetry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest extension telemetry events' })
  async ingest(@Body() body: any) {
    const count = await this.analyticsService.ingestBatch({
      extensionVersion: body.extensionVersion || 'unknown',
      tenantId: body.tenantId || 'community',
      mode: body.mode || 'community',
      sessionId: body.sessionId,
      events: Array.isArray(body.events) ? body.events : [],
    });
    return { received: count };
  }

  /**
   * GET /api/extension/analytics/dashboard
   * Dashboard des metriques d'utilisation de l'extension.
   */
  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Extension usage analytics dashboard' })
  async dashboard(@Query('days') days?: string) {
    const d = parseInt(days, 10) || 30;
    return this.analyticsService.getDashboard(d);
  }
}
