import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { License, LicenseStatus } from '../../entities/license.entity';

@Injectable()
export class GlobalMetricsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantMetric)
    private metricRepository: Repository<TenantMetric>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
  ) {}

  async getSummary() {
    // Total tenants
    const totalTenants = await this.tenantRepository.count();
    const activeTenants = await this.tenantRepository.count({
      where: { active: true },
    });

    // Total licenses
    const totalLicenses = await this.licenseRepository.count();
    const activeLicenses = await this.licenseRepository.count({
      where: { status: LicenseStatus.ACTIVE },
    });

    // Get latest metrics for all tenants
    const latestMetrics = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.tenantId')
      .addSelect('MAX(metric.timestamp)', 'latestTimestamp')
      .groupBy('metric.tenantId')
      .getRawMany();

    const totalActiveUsers = await this.getTotalActiveUsers();
    const totalExercisesCompleted = await this.getTotalExercisesCompleted();

    // Average AI Latency
    const avgLatencyResult = await this.metricRepository
      .createQueryBuilder('metric')
      .select('AVG(metric.aiLatency)', 'avgLatency')
      .where('metric.aiLatency IS NOT NULL')
      .andWhere('metric.timestamp >= NOW() - INTERVAL \'24 hours\'')
      .getRawOne();

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
      },
      licenses: {
        total: totalLicenses,
        active: activeLicenses,
        expired: await this.licenseRepository.count({
          where: { status: LicenseStatus.EXPIRED },
        }),
        revoked: await this.licenseRepository.count({
          where: { status: LicenseStatus.REVOKED },
        }),
      },
      usage: {
        totalActiveUsers,
        totalExercisesCompletedToday: totalExercisesCompleted,
        averageAiLatency: avgLatencyResult?.avgLatency
          ? Math.round(parseFloat(avgLatencyResult.avgLatency) * 100) / 100
          : null,
      },
      timestamp: new Date(),
    };
  }

  async getTopRisk() {
    const riskThreshold = new Date();
    riskThreshold.setMinutes(riskThreshold.getMinutes() - 30);

    // Get all tenants
    const tenants = await this.tenantRepository.find({
      where: { active: true },
    });

    const riskyTenants = [];

    for (const tenant of tenants) {
      const latestMetric = await this.metricRepository.findOne({
        where: { tenantId: tenant.id },
        order: { timestamp: 'DESC' },
      });

      if (!latestMetric) {
        riskyTenants.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          riskLevel: 'CRITICAL',
          reason: 'Aucune métrique reçue',
          lastUpdate: null,
        });
        continue;
      }

      const lastUpdate = new Date(latestMetric.timestamp);
      const minutesAgo = (new Date().getTime() - lastUpdate.getTime()) / 1000 / 60;

      if (minutesAgo > 60) {
        riskyTenants.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          riskLevel: 'CRITICAL',
          reason: `Aucune donnée depuis ${Math.round(minutesAgo)} minutes`,
          lastUpdate: latestMetric.timestamp,
        });
      } else if (minutesAgo > 30) {
        riskyTenants.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          riskLevel: 'WARNING',
          reason: `Aucune donnée depuis ${Math.round(minutesAgo)} minutes`,
          lastUpdate: latestMetric.timestamp,
        });
      } else if (latestMetric.aiLatency && latestMetric.aiLatency > 1000) {
        riskyTenants.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          riskLevel: 'WARNING',
          reason: `Latence AI élevée: ${latestMetric.aiLatency}ms`,
          lastUpdate: latestMetric.timestamp,
        });
      }
    }

    // Sort by risk level (CRITICAL first)
    riskyTenants.sort((a, b) => {
      if (a.riskLevel === 'CRITICAL' && b.riskLevel !== 'CRITICAL') return -1;
      if (a.riskLevel !== 'CRITICAL' && b.riskLevel === 'CRITICAL') return 1;
      return 0;
    });

    return {
      totalRiskyTenants: riskyTenants.length,
      critical: riskyTenants.filter((t) => t.riskLevel === 'CRITICAL').length,
      warning: riskyTenants.filter((t) => t.riskLevel === 'WARNING').length,
      tenants: riskyTenants,
    };
  }

  async getUsageTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.metricRepository
      .createQueryBuilder('metric')
      .where('metric.timestamp >= :startDate', { startDate })
      .orderBy('metric.timestamp', 'ASC')
      .getMany();

    // Group by day
    const dailyStats = new Map<string, any>();

    metrics.forEach((metric) => {
      const day = metric.timestamp.toISOString().split('T')[0];

      if (!dailyStats.has(day)) {
        dailyStats.set(day, {
          date: day,
          activeUsers: [],
          exercises: [],
          aiLatency: [],
          tenantsReporting: new Set(),
        });
      }

      const dayData = dailyStats.get(day);
      dayData.activeUsers.push(metric.activeUsers);
      dayData.exercises.push(metric.exercisesCompletedToday);
      if (metric.aiLatency) {
        dayData.aiLatency.push(metric.aiLatency);
      }
      dayData.tenantsReporting.add(metric.tenantId);
    });

    // Calculate averages
    const trends = Array.from(dailyStats.values()).map((day) => ({
      date: day.date,
      avgActiveUsers: Math.round(
        day.activeUsers.reduce((a, b) => a + b, 0) / day.activeUsers.length,
      ),
      totalExercises: day.exercises.reduce((a, b) => a + b, 0),
      avgAiLatency:
        day.aiLatency.length > 0
          ? Math.round(
              (day.aiLatency.reduce((a, b) => a + b, 0) / day.aiLatency.length) *
                100,
            ) / 100
          : null,
      tenantsReporting: day.tenantsReporting.size,
    }));

    return {
      days,
      startDate,
      endDate: new Date(),
      dataPoints: trends.length,
      trends,
    };
  }

  private async getTotalActiveUsers(): Promise<number> {
    // Get latest metric for each tenant and sum active users
    const result = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.tenantId')
      .addSelect('metric.activeUsers')
      .addSelect('MAX(metric.timestamp)', 'latestTimestamp')
      .groupBy('metric.tenantId')
      .addGroupBy('metric.activeUsers')
      .getRawMany();

    return result.reduce((sum, row) => sum + (row.activeUsers || 0), 0);
  }

  private async getTotalExercisesCompleted(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.metricRepository
      .createQueryBuilder('metric')
      .select('SUM(metric.exercisesCompletedToday)', 'total')
      .where('metric.timestamp >= :today', { today })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}

