import { Controller, Post, Get, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { M365ScanService } from './m365-scan.service';
import { FindingCategory } from '../../entities/m365-finding.entity';
import { ScanTrigger } from '../../entities/m365-scan.entity';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { PlanType } from '../../entities/subscription.entity';

@ApiTags('M365 Scan')
@Controller('m365/scan')
export class M365ScanController {
  private readonly logger = new Logger(M365ScanController.name);

  constructor(private readonly scanService: M365ScanService) {}

  @Post('trigger/:tenantId')
  @ApiOperation({ summary: 'Trigger a new M365 security scan' })
  @ApiResponse({ status: 201, description: 'Scan initiated' })
  async triggerScan(
    @Param('tenantId') tenantId: string,
    @Query('categories') categoriesStr?: string,
  ) {
    const categories = categoriesStr
      ? (categoriesStr.split(',') as FindingCategory[])
      : undefined;

    this.logger.log(`Triggering scan for tenant ${tenantId}`);
    const scan = await this.scanService.triggerScan(tenantId, ScanTrigger.MANUAL, categories);
    return { scanId: scan.id, status: scan.status, message: 'Scan initiated' };
  }

  @Get(':scanId')
  @ApiOperation({ summary: 'Get scan details by ID' })
  @ApiResponse({ status: 200, description: 'Scan details' })
  async getScan(@Param('scanId') scanId: string) {
    return this.scanService.getScan(scanId);
  }

  @Get('tenant/:tenantId/latest')
  @ApiOperation({ summary: 'Get latest scan for a tenant' })
  @ApiResponse({ status: 200, description: 'Latest scan with findings' })
  async getLatestScan(@Param('tenantId') tenantId: string) {
    return this.scanService.getLatestScan(tenantId);
  }

  @Get('tenant/:tenantId/history')
  @UseGuards(PlanGuard)
  @PlanRequired(PlanType.STARTER)
  @ApiOperation({ summary: 'Get scan history for a tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getScanHistory(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.scanService.getScanHistory(tenantId, limit || 20, offset || 0);
  }

  @Get(':scanId/findings')
  @ApiOperation({ summary: 'Get findings for a specific scan' })
  @ApiQuery({ name: 'category', required: false, enum: FindingCategory })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getScanFindings(
    @Param('scanId') scanId: string,
    @Query('category') category?: FindingCategory,
    @Query('severity') severity?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.scanService.getScanFindings(scanId, category, severity, limit || 50, offset || 0);
  }
}
