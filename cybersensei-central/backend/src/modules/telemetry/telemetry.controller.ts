import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { TelemetryDto } from './dto/telemetry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('Telemetry')
@Controller()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  // ============================================
  // PUBLIC ENDPOINT (For Nodes)
  // ============================================

  @Post('telemetry')
  @ApiOperation({
    summary: 'Ingérer des données de télémétrie (utilisé par les nodes)',
    description: `
      Enregistre une entrée de télémétrie depuis un node client.
      
      **Validations effectuées:**
      - Le tenant existe
      - Le tenant est actif
      
      **Données stockées:**
      - Uptime (secondes)
      - Utilisateurs actifs
      - Exercices complétés aujourd'hui
      - Latence IA (optionnel)
      - Version du node (optionnel)
      - Données additionnelles (JSONB, optionnel)
      
      **Fréquence recommandée:** Toutes les 5-10 minutes
    `,
  })
  @ApiBody({ type: TelemetryDto })
  @ApiResponse({
    status: 201,
    description: 'Télémétrie enregistrée avec succès',
    schema: {
      example: {
        success: true,
        message: 'Télémétrie enregistrée avec succès',
        timestamp: '2025-11-24T10:30:00.000Z',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Tenant inactif ou données invalides' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async ingest(@Body(ValidationPipe) telemetryDto: TelemetryDto) {
    return this.telemetryService.ingest(telemetryDto);
  }

  // ============================================
  // ADMIN ENDPOINTS (Protected)
  // ============================================

  @Get('admin/tenant/:id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Récupérer les métriques d\'un tenant',
    description: 'Retourne l\'historique des métriques avec pagination',
  })
  @ApiParam({ name: 'id', description: 'ID du tenant (UUID)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 100,
    description: 'Nombre de résultats (max 1000)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Offset pour la pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Métriques récupérées',
    schema: {
      example: {
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        tenantName: 'acme-corp',
        data: [
          {
            id: 'metric-uuid',
            uptime: 86400,
            activeUsers: 42,
            exercisesCompletedToday: 156,
            aiLatency: 247.5,
            version: '1.2.0',
            timestamp: '2025-11-24T10:30:00.000Z',
          },
        ],
        pagination: {
          total: 245,
          limit: 100,
          offset: 0,
          hasMore: true,
        },
      },
    },
  })
  async getMetricsByTenant(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    // Limiter le maximum à 1000
    const safeLimit = Math.min(limit || 100, 1000);
    return this.telemetryService.getMetricsByTenant(id, safeLimit, offset);
  }

  @Get('admin/tenant/:id/metrics/latest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer la dernière métrique d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant (UUID)' })
  @ApiResponse({ status: 200, description: 'Dernière métrique récupérée' })
  async getLatestMetric(@Param('id') id: string) {
    return this.telemetryService.getLatestMetric(id);
  }

  @Get('admin/tenant/:id/metrics/aggregated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Récupérer les métriques agrégées d\'un tenant',
    description: `
      Calcule les métriques agrégées sur une période donnée.
      
      **Périodes disponibles:**
      - \`24h\`: Dernières 24 heures
      - \`7d\`: 7 derniers jours
      - \`30d\`: 30 derniers jours
      
      **Métriques calculées:**
      - Moyennes (uptime, users, exercises, AI latency)
      - Min/Max (users, exercises, AI latency)
      - Total exercices
      - Tendances (croissante, décroissante, stable)
    `,
  })
  @ApiParam({ name: 'id', description: 'ID du tenant (UUID)' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['24h', '7d', '30d'],
    example: '7d',
    description: 'Période d\'agrégation',
  })
  @ApiResponse({
    status: 200,
    description: 'Métriques agrégées récupérées',
    schema: {
      example: {
        period: '7d',
        startDate: '2025-11-17T10:30:00.000Z',
        endDate: '2025-11-24T10:30:00.000Z',
        dataPoints: 196,
        metrics: {
          avgUptime: 82345,
          avgActiveUsers: 38.5,
          avgExercisesPerDay: 142.3,
          avgAiLatency: 245.7,
          maxActiveUsers: 67,
          maxExercises: 234,
          maxAiLatency: 456.2,
          minActiveUsers: 12,
          minExercises: 45,
          minAiLatency: 156.3,
          totalExercises: 27891,
        },
        trend: {
          activeUsers: 'increasing',
          exercises: 'stable',
          aiLatency: 'decreasing',
        },
      },
    },
  })
  async getAggregatedMetrics(
    @Param('id') id: string,
    @Query('period') period?: '24h' | '7d' | '30d',
  ) {
    return this.telemetryService.getAggregatedMetrics(id, period || '7d');
  }

  // ============================================
  // GLOBAL METRICS (Admin Dashboard)
  // ============================================

  @Get('admin/global/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Résumé global de la plateforme',
    description: `
      Vue d'ensemble complète de la plateforme incluant:
      - Statistiques tenants (total, actifs, avec données récentes)
      - Statistiques licences (total, actives, expirées, expirant bientôt)
      - Usage global (users actifs, exercices, latence IA, uptime)
      - Santé globale (healthy, warning, critical, no data)
      - Distribution des versions
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Résumé récupéré',
    schema: {
      example: {
        timestamp: '2025-11-24T10:30:00.000Z',
        tenants: {
          total: 42,
          active: 38,
          inactive: 4,
          withRecentData: 35,
        },
        licenses: {
          total: 56,
          active: 45,
          expired: 8,
          expiringSoon: 5,
        },
        usage: {
          totalActiveUsers: 1847,
          totalExercisesCompletedToday: 4532,
          averageAiLatency: 245.67,
          totalUptime: 3245678,
        },
        health: {
          healthy: 32,
          warning: 3,
          critical: 2,
          noData: 1,
        },
        versions: [
          { version: '1.2.0', count: 25 },
          { version: '1.1.0', count: 10 },
          { version: '1.0.0', count: 3 },
        ],
      },
    },
  })
  async getGlobalSummary() {
    return this.telemetryService.getGlobalSummary();
  }

  @Get('admin/global/usage-trends')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Tendances d\'utilisation globales',
    description: `
      Analyse les tendances d'utilisation sur une période donnée.
      
      **Données par jour:**
      - Moyenne utilisateurs actifs
      - Total exercices complétés
      - Latence IA moyenne
      - Nombre de tenants rapportant
      - Pourcentage uptime
      
      **Résumé:**
      - Moyennes quotidiennes
      - Pic d'utilisation (date + valeur)
    `,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    example: 30,
    description: 'Nombre de jours (max 90)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tendances récupérées',
    schema: {
      example: {
        period: '30 days',
        startDate: '2025-10-25T10:30:00.000Z',
        endDate: '2025-11-24T10:30:00.000Z',
        dataPoints: 30,
        trends: [
          {
            date: '2025-11-24',
            avgActiveUsers: 42.5,
            totalExercises: 1456,
            avgAiLatency: 245.7,
            tenantsReporting: 35,
            uptimePercentage: 99.9,
          },
        ],
        summary: {
          avgDailyUsers: 38.7,
          avgDailyExercises: 1342,
          avgAiLatency: 247.3,
          peakUsers: 67,
          peakDate: '2025-11-20',
        },
      },
    },
  })
  async getUsageTrends(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days?: number,
  ) {
    // Limiter le maximum à 90 jours
    const safeDays = Math.min(days || 30, 90);
    return this.telemetryService.getUsageTrends(safeDays);
  }
}
