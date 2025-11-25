import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { Tenant } from '../../entities/tenant.entity';
import { License, LicenseStatus } from '../../entities/license.entity';
import { TelemetryDto } from './dto/telemetry.dto';
import {
  AggregatedMetrics,
  GlobalSummary,
  UsageTrends,
  UsageTrend,
} from './interfaces/aggregated-metrics.interface';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @InjectRepository(TenantMetric)
    private metricRepository: Repository<TenantMetric>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
  ) {}

  /**
   * Ingérer une entrée de télémétrie
   */
  async ingest(telemetryDto: TelemetryDto) {
    this.logger.log(
      `Ingestion télémétrie pour tenant: ${telemetryDto.tenantId}`,
    );

    // Vérifier que le tenant existe et est actif
    const tenant = await this.tenantRepository.findOne({
      where: { id: telemetryDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    if (!tenant.active) {
      throw new BadRequestException('Tenant inactif');
    }

    // Créer l'entrée de métrique
    const metric = this.metricRepository.create({
      tenantId: telemetryDto.tenantId,
      uptime: telemetryDto.uptime,
      activeUsers: telemetryDto.activeUsers,
      exercisesCompletedToday: telemetryDto.exercisesCompletedToday,
      aiLatency: telemetryDto.aiLatency,
      version: telemetryDto.version,
      additionalData: telemetryDto.additionalData,
    });

    await this.metricRepository.save(metric);

    this.logger.log(
      `Télémétrie enregistrée: ${telemetryDto.activeUsers} users, ${telemetryDto.exercisesCompletedToday} exercises`,
    );

    return {
      success: true,
      message: 'Télémétrie enregistrée avec succès',
      timestamp: metric.timestamp,
      tenantId: metric.tenantId,
    };
  }

  /**
   * Récupérer les métriques d'un tenant avec pagination
   */
  async getMetricsByTenant(
    tenantId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    // Vérifier que le tenant existe
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    const [metrics, total] = await this.metricRepository.findAndCount({
      where: { tenantId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      tenantId,
      tenantName: tenant.name,
      data: metrics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Calculer les métriques agrégées pour un tenant
   */
  async getAggregatedMetrics(
    tenantId: string,
    period: '24h' | '7d' | '30d' = '24h',
  ): Promise<AggregatedMetrics> {
    // Vérifier que le tenant existe
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    // Calculer les dates
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Récupérer les métriques
    const metrics = await this.metricRepository.find({
      where: {
        tenantId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });

    if (metrics.length === 0) {
      throw new NotFoundException(
        `Aucune métrique trouvée pour la période ${period}`,
      );
    }

    // Calculer les agrégations
    const totals = metrics.reduce(
      (acc, metric) => ({
        uptime: acc.uptime + metric.uptime,
        activeUsers: acc.activeUsers + metric.activeUsers,
        exercises: acc.exercises + metric.exercisesCompletedToday,
        aiLatency:
          acc.aiLatency + (metric.aiLatency || 0),
        aiLatencyCount:
          acc.aiLatencyCount + (metric.aiLatency ? 1 : 0),
      }),
      {
        uptime: 0,
        activeUsers: 0,
        exercises: 0,
        aiLatency: 0,
        aiLatencyCount: 0,
      },
    );

    const count = metrics.length;

    // Calculer min/max
    const activeUsersArray = metrics.map((m) => m.activeUsers);
    const exercisesArray = metrics.map((m) => m.exercisesCompletedToday);
    const aiLatencyArray = metrics
      .filter((m) => m.aiLatency !== null && m.aiLatency !== undefined)
      .map((m) => m.aiLatency);

    // Calculer les tendances
    const trend = this.calculateTrend(metrics);

    return {
      period,
      startDate,
      endDate,
      dataPoints: count,

      metrics: {
        avgUptime: Math.round(totals.uptime / count),
        avgActiveUsers: Math.round((totals.activeUsers / count) * 100) / 100,
        avgExercisesPerDay:
          Math.round((totals.exercises / count) * 100) / 100,
        avgAiLatency:
          totals.aiLatencyCount > 0
            ? Math.round((totals.aiLatency / totals.aiLatencyCount) * 100) /
              100
            : null,

        maxActiveUsers: Math.max(...activeUsersArray),
        maxExercises: Math.max(...exercisesArray),
        maxAiLatency:
          aiLatencyArray.length > 0 ? Math.max(...aiLatencyArray) : null,

        minActiveUsers: Math.min(...activeUsersArray),
        minExercises: Math.min(...exercisesArray),
        minAiLatency:
          aiLatencyArray.length > 0 ? Math.min(...aiLatencyArray) : null,

        totalExercises: totals.exercises,
      },

      trend,
    };
  }

  /**
   * Calculer la tendance (croissante, décroissante, stable)
   */
  private calculateTrend(metrics: TenantMetric[]): AggregatedMetrics['trend'] {
    if (metrics.length < 2) {
      return {
        activeUsers: 'stable',
        exercises: 'stable',
        aiLatency: 'stable',
      };
    }

    const midPoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midPoint);
    const secondHalf = metrics.slice(midPoint);

    const avgFirstHalf = {
      activeUsers:
        firstHalf.reduce((sum, m) => sum + m.activeUsers, 0) /
        firstHalf.length,
      exercises:
        firstHalf.reduce((sum, m) => sum + m.exercisesCompletedToday, 0) /
        firstHalf.length,
      aiLatency:
        firstHalf.reduce((sum, m) => sum + (m.aiLatency || 0), 0) /
        firstHalf.filter((m) => m.aiLatency).length,
    };

    const avgSecondHalf = {
      activeUsers:
        secondHalf.reduce((sum, m) => sum + m.activeUsers, 0) /
        secondHalf.length,
      exercises:
        secondHalf.reduce((sum, m) => sum + m.exercisesCompletedToday, 0) /
        secondHalf.length,
      aiLatency:
        secondHalf.reduce((sum, m) => sum + (m.aiLatency || 0), 0) /
        secondHalf.filter((m) => m.aiLatency).length,
    };

    const threshold = 0.1; // 10% de variation

    const getTrend = (first: number, second: number): 'increasing' | 'decreasing' | 'stable' => {
      const change = (second - first) / first;
      if (change > threshold) return 'increasing';
      if (change < -threshold) return 'decreasing';
      return 'stable';
    };

    return {
      activeUsers: getTrend(avgFirstHalf.activeUsers, avgSecondHalf.activeUsers),
      exercises: getTrend(avgFirstHalf.exercises, avgSecondHalf.exercises),
      aiLatency: isNaN(avgFirstHalf.aiLatency) || isNaN(avgSecondHalf.aiLatency)
        ? 'n/a'
        : getTrend(avgFirstHalf.aiLatency, avgSecondHalf.aiLatency),
    };
  }

  /**
   * Récupérer la dernière métrique d'un tenant
   */
  async getLatestMetric(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    const metric = await this.metricRepository.findOne({
      where: { tenantId },
      order: { timestamp: 'DESC' },
    });

    if (!metric) {
      throw new NotFoundException(
        'Aucune métrique trouvée pour ce tenant',
      );
    }

    return {
      tenantId,
      tenantName: tenant.name,
      metric,
    };
  }

  /**
   * Résumé global de la plateforme
   */
  async getGlobalSummary(): Promise<GlobalSummary> {
    this.logger.log('Calcul du résumé global...');

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Tenants
    const totalTenants = await this.tenantRepository.count();
    const activeTenants = await this.tenantRepository.count({
      where: { active: true },
    });

    // Tenants avec données récentes
    const recentMetrics = await this.metricRepository
      .createQueryBuilder('metric')
      .select('DISTINCT metric.tenantId', 'tenantId')
      .where('metric.timestamp >= :oneHourAgo', { oneHourAgo })
      .getRawMany();

    const withRecentData = recentMetrics.length;

    // Licences
    const totalLicenses = await this.licenseRepository.count();
    const activeLicenses = await this.licenseRepository.count({
      where: { status: LicenseStatus.ACTIVE },
    });
    const expiredLicenses = await this.licenseRepository.count({
      where: { status: LicenseStatus.EXPIRED },
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = await this.licenseRepository.count({
      where: {
        status: LicenseStatus.ACTIVE,
        expiresAt: Between(now, thirtyDaysFromNow),
      },
    });

    // Usage (dernières métriques de chaque tenant)
    const latestMetrics = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.tenantId', 'tenantId')
      .addSelect('MAX(metric.timestamp)', 'latestTimestamp')
      .groupBy('metric.tenantId')
      .getRawMany();

    let totalActiveUsers = 0;
    let totalExercisesToday = 0;
    let totalAiLatency = 0;
    let aiLatencyCount = 0;
    let totalUptime = 0;

    for (const { tenantId } of latestMetrics) {
      const latestMetric = await this.metricRepository.findOne({
        where: { tenantId },
        order: { timestamp: 'DESC' },
      });

      if (latestMetric) {
        totalActiveUsers += latestMetric.activeUsers;
        totalExercisesToday += latestMetric.exercisesCompletedToday;
        totalUptime += latestMetric.uptime;

        if (latestMetric.aiLatency) {
          totalAiLatency += latestMetric.aiLatency;
          aiLatencyCount++;
        }
      }
    }

    // Santé des tenants
    const health = await this.calculateGlobalHealth();

    // Distribution des versions
    const versions = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.version', 'version')
      .addSelect('COUNT(DISTINCT metric.tenantId)', 'count')
      .where('metric.version IS NOT NULL')
      .andWhere('metric.timestamp >= :oneDayAgo', {
        oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      })
      .groupBy('metric.version')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      timestamp: now,

      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
        withRecentData,
      },

      licenses: {
        total: totalLicenses,
        active: activeLicenses,
        expired: expiredLicenses,
        expiringSoon,
      },

      usage: {
        totalActiveUsers,
        totalExercisesCompletedToday: totalExercisesToday,
        averageAiLatency:
          aiLatencyCount > 0
            ? Math.round((totalAiLatency / aiLatencyCount) * 100) / 100
            : null,
        totalUptime,
      },

      health,

      versions: versions.map((v) => ({
        version: v.version,
        count: parseInt(v.count, 10),
      })),
    };
  }

  /**
   * Calculer la santé globale
   */
  private async calculateGlobalHealth() {
    const now = new Date();
    const tenants = await this.tenantRepository.find({
      where: { active: true },
    });

    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let noData = 0;

    for (const tenant of tenants) {
      const latestMetric = await this.metricRepository.findOne({
        where: { tenantId: tenant.id },
        order: { timestamp: 'DESC' },
      });

      if (!latestMetric) {
        noData++;
        continue;
      }

      const minutesSinceUpdate =
        (now.getTime() - latestMetric.timestamp.getTime()) / 1000 / 60;

      if (minutesSinceUpdate > 60) {
        critical++;
      } else if (minutesSinceUpdate > 30) {
        warning++;
      } else {
        healthy++;
      }
    }

    return {
      healthy,
      warning,
      critical,
      noData,
    };
  }

  /**
   * Tendances d'utilisation sur une période
   */
  async getUsageTrends(days: number = 30): Promise<UsageTrends> {
    this.logger.log(`Calcul des tendances sur ${days} jours...`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.metricRepository
      .createQueryBuilder('metric')
      .where('metric.timestamp >= :startDate', { startDate })
      .andWhere('metric.timestamp <= :endDate', { endDate })
      .orderBy('metric.timestamp', 'ASC')
      .getMany();

    if (metrics.length === 0) {
      throw new NotFoundException('Aucune métrique trouvée pour cette période');
    }

    // Grouper par jour
    const dailyStats = new Map<string, UsageTrend>();

    metrics.forEach((metric) => {
      const day = metric.timestamp.toISOString().split('T')[0];

      if (!dailyStats.has(day)) {
        dailyStats.set(day, {
          date: day,
          avgActiveUsers: 0,
          totalExercises: 0,
          avgAiLatency: null,
          tenantsReporting: 0,
          uptimePercentage: 0,
        });
      }

      const dayData = dailyStats.get(day);
      dayData.avgActiveUsers += metric.activeUsers;
      dayData.totalExercises += metric.exercisesCompletedToday;
      
      if (metric.aiLatency) {
        if (dayData.avgAiLatency === null) {
          dayData.avgAiLatency = metric.aiLatency;
        } else {
          dayData.avgAiLatency = (dayData.avgAiLatency + metric.aiLatency) / 2;
        }
      }
    });

    // Calculer les moyennes et compter les tenants uniques par jour
    const trends: UsageTrend[] = [];
    let totalUsers = 0;
    let totalExercises = 0;
    let totalAiLatency = 0;
    let aiLatencyCount = 0;
    let peakUsers = 0;
    let peakDate = '';

    for (const [date, data] of dailyStats) {
      // Compter les tenants uniques pour ce jour
      const dayMetrics = metrics.filter(
        (m) => m.timestamp.toISOString().split('T')[0] === date,
      );
      const uniqueTenants = new Set(dayMetrics.map((m) => m.tenantId)).size;
      const metricsCount = dayMetrics.length;

      const avgUsers = Math.round((data.avgActiveUsers / metricsCount) * 100) / 100;
      const avgLatency = data.avgAiLatency
        ? Math.round(data.avgAiLatency * 100) / 100
        : null;

      trends.push({
        date,
        avgActiveUsers: avgUsers,
        totalExercises: data.totalExercises,
        avgAiLatency: avgLatency,
        tenantsReporting: uniqueTenants,
        uptimePercentage: 99.9, // TODO: calculer réellement
      });

      totalUsers += avgUsers;
      totalExercises += data.totalExercises;
      
      if (avgLatency) {
        totalAiLatency += avgLatency;
        aiLatencyCount++;
      }

      if (avgUsers > peakUsers) {
        peakUsers = avgUsers;
        peakDate = date;
      }
    }

    const dataPoints = trends.length;

    return {
      period: `${days} days`,
      startDate,
      endDate,
      dataPoints,
      trends,

      summary: {
        avgDailyUsers: Math.round((totalUsers / dataPoints) * 100) / 100,
        avgDailyExercises: Math.round(totalExercises / dataPoints),
        avgAiLatency:
          aiLatencyCount > 0
            ? Math.round((totalAiLatency / aiLatencyCount) * 100) / 100
            : null,
        peakUsers,
        peakDate,
      },
    };
  }
}
