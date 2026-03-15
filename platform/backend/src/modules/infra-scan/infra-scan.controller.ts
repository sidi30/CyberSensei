import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InfraScanService } from './infra-scan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Infrastructure Scan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('infra-scan')
export class InfraScanController {
  constructor(private readonly infraScanService: InfraScanService) {}

  @Post('launch')
  @ApiOperation({ summary: 'Launch an infrastructure scan' })
  async launchScan(
    @Body() body: { tenantId: string; domain: string; emails?: string[] },
  ) {
    return this.infraScanService.launchScan(
      body.tenantId,
      body.domain,
      body.emails,
    );
  }

  @Get('history/:tenantId')
  @ApiOperation({ summary: 'Get scan history for a tenant' })
  async getScanHistory(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.infraScanService.getScanHistory(tenantId, limit);
  }

  @Get(':scanId')
  @ApiOperation({ summary: 'Get scan details by ID' })
  async getScanById(@Param('scanId') scanId: string) {
    return this.infraScanService.getScanById(scanId);
  }

  @Get('latest/:tenantId/:domain')
  @ApiOperation({ summary: 'Get latest completed scan' })
  async getLatestScan(
    @Param('tenantId') tenantId: string,
    @Param('domain') domain: string,
  ) {
    return this.infraScanService.getLatestScan(tenantId, domain);
  }
}
