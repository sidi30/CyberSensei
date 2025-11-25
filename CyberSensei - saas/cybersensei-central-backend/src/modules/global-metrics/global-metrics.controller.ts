import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { GlobalMetricsService } from './global-metrics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('Global Metrics')
@Controller('admin/global')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
@ApiBearerAuth('JWT-auth')
export class GlobalMetricsController {
  constructor(private readonly globalMetricsService: GlobalMetricsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Résumé global de la plateforme' })
  @ApiResponse({ status: 200, description: 'Résumé récupéré' })
  async getSummary() {
    return this.globalMetricsService.getSummary();
  }

  @Get('top-risk')
  @ApiOperation({ summary: 'Tenants à risque' })
  @ApiResponse({ status: 200, description: 'Liste des tenants à risque' })
  async getTopRisk() {
    return this.globalMetricsService.getTopRisk();
  }

  @Get('usage-trends')
  @ApiOperation({ summary: 'Tendances d\'utilisation globales' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({ status: 200, description: 'Tendances récupérées' })
  async getUsageTrends(@Query('days') days?: number) {
    return this.globalMetricsService.getUsageTrends(days || 30);
  }
}

