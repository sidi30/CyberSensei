import { Controller, Get, Post, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { M365AlertService } from './m365-alert.service';

@ApiTags('M365 Alert')
@Controller('m365/alert')
export class M365AlertController {
  private readonly logger = new Logger(M365AlertController.name);

  constructor(private readonly alertService: M365AlertService) {}

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get alerts for a tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAlerts(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.alertService.getAlerts(tenantId, limit || 50, offset || 0);
  }

  @Post(':alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged' })
  async acknowledgeAlert(@Param('alertId') alertId: string) {
    return this.alertService.acknowledgeAlert(alertId);
  }

  @Post('retry-failed')
  @ApiOperation({ summary: 'Retry sending failed alert emails' })
  @ApiResponse({ status: 200, description: 'Number of alerts retried' })
  async retryFailed() {
    const count = await this.alertService.retryFailedAlerts();
    return { retriedCount: count };
  }
}
