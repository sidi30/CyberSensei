import { Controller, Get, Post, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { M365ScoreService } from './m365-score.service';

@ApiTags('M365 Score')
@Controller('m365/score')
export class M365ScoreController {
  private readonly logger = new Logger(M365ScoreController.name);

  constructor(private readonly scoreService: M365ScoreService) {}

  @Post('calculate/:scanId/:tenantId')
  @ApiOperation({ summary: 'Calculate score for a scan' })
  @ApiResponse({ status: 201, description: 'Score calculated' })
  async calculateScore(
    @Param('scanId') scanId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.scoreService.calculateScore(scanId, tenantId);
  }

  @Get('tenant/:tenantId/latest')
  @ApiOperation({ summary: 'Get latest score for a tenant' })
  @ApiResponse({ status: 200, description: 'Latest score' })
  async getLatestScore(@Param('tenantId') tenantId: string) {
    return this.scoreService.getLatestScore(tenantId);
  }

  @Get('tenant/:tenantId/history')
  @ApiOperation({ summary: 'Get score history for a tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getScoreHistory(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.scoreService.getScoreHistory(tenantId, limit || 30);
  }

  @Get('scan/:scanId')
  @ApiOperation({ summary: 'Get score for a specific scan' })
  @ApiResponse({ status: 200, description: 'Score details' })
  async getScoreByScan(@Param('scanId') scanId: string) {
    return this.scoreService.getScoreByScanId(scanId);
  }
}
