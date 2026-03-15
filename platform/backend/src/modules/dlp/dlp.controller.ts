import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DlpService } from './dlp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('DLP')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dlp')
export class DlpController {
  constructor(private readonly dlpService: DlpService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a prompt for sensitive data' })
  async analyzePrompt(
    @Body() body: {
      tenantId: string;
      userId: string;
      prompt: string;
      aiTool: string;
      sourceUrl?: string;
    },
  ) {
    return this.dlpService.analyzePrompt(
      body.tenantId,
      body.userId,
      body.prompt,
      body.aiTool,
      body.sourceUrl,
    );
  }

  @Get('alerts/:tenantId')
  @ApiOperation({ summary: 'Get DLP alerts for a tenant' })
  async getAlerts(
    @Param('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.dlpService.getAlerts(tenantId, status as any);
  }

  @Patch('alerts/:alertId/resolve')
  @ApiOperation({ summary: 'Resolve a DLP alert' })
  async resolveAlert(@Param('alertId') alertId: string) {
    return this.dlpService.resolveAlert(alertId);
  }

  @Patch('alerts/:alertId/dismiss')
  @ApiOperation({ summary: 'Dismiss a DLP alert' })
  async dismissAlert(@Param('alertId') alertId: string) {
    return this.dlpService.dismissAlert(alertId);
  }

  @Get('stats/:tenantId')
  @ApiOperation({ summary: 'Get DLP statistics for a tenant' })
  async getStats(@Param('tenantId') tenantId: string) {
    return this.dlpService.getStats(tenantId);
  }

  @Get('events/:tenantId')
  @ApiOperation({ summary: 'Get recent DLP events for a tenant' })
  async getRecentEvents(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.dlpService.getRecentEvents(tenantId, limit);
  }
}
