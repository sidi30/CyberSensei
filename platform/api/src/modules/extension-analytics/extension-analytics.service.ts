import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { ExtensionAnalytics } from '../../entities/extension-analytics.entity';

@Injectable()
export class ExtensionAnalyticsService {
  private readonly logger = new Logger(ExtensionAnalyticsService.name);

  constructor(
    @InjectRepository(ExtensionAnalytics)
    private repo: Repository<ExtensionAnalytics>,
  ) {}

  /**
   * Ingere un batch d'events depuis l'extension Chrome.
   */
  async ingestBatch(payload: {
    extensionVersion: string;
    tenantId: string;
    mode: string;
    sessionId?: string;
    events: Array<{ e: string; d?: any; t: number }>;
  }): Promise<number> {
    const entities = payload.events.map((event) =>
      this.repo.create({
        tenantId: payload.tenantId || 'community',
        mode: payload.mode || 'community',
        extensionVersion: payload.extensionVersion || 'unknown',
        eventName: event.e,
        eventData: event.d || {},
        eventTimestamp: event.t,
        sessionId: payload.sessionId,
      }),
    );

    await this.repo.save(entities);
    this.logger.log(
      `Ingere ${entities.length} events (tenant: ${payload.tenantId}, mode: ${payload.mode})`,
    );
    return entities.length;
  }

  /**
   * Dashboard analytics : resume des metriques cles.
   */
  async getDashboard(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalEvents,
      uniqueSessions,
      eventBreakdown,
      dailyActivity,
      modeBreakdown,
      topQuizTopics,
      dlpStats,
    ] = await Promise.all([
      // Total events
      this.repo.count({
        where: { createdAt: MoreThanOrEqual(since) },
      }),

      // Sessions uniques
      this.repo
        .createQueryBuilder('ea')
        .select('COUNT(DISTINCT ea.sessionId)', 'count')
        .where('ea.createdAt >= :since', { since })
        .getRawOne(),

      // Breakdown par event
      this.repo
        .createQueryBuilder('ea')
        .select('ea.eventName', 'event')
        .addSelect('COUNT(*)', 'count')
        .where('ea.createdAt >= :since', { since })
        .groupBy('ea.eventName')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // Activite quotidienne (7 derniers jours)
      this.repo
        .createQueryBuilder('ea')
        .select("DATE(ea.createdAt)", 'date')
        .addSelect('COUNT(*)', 'events')
        .addSelect('COUNT(DISTINCT ea.sessionId)', 'sessions')
        .where('ea.createdAt >= :since7', {
          since7: new Date(Date.now() - 7 * 86400000),
        })
        .groupBy("DATE(ea.createdAt)")
        .orderBy('date', 'ASC')
        .getRawMany(),

      // Community vs Enterprise
      this.repo
        .createQueryBuilder('ea')
        .select('ea.mode', 'mode')
        .addSelect('COUNT(DISTINCT ea.sessionId)', 'sessions')
        .where('ea.createdAt >= :since', { since })
        .groupBy('ea.mode')
        .getRawMany(),

      // Top sujets de quiz
      this.repo
        .createQueryBuilder('ea')
        .select("ea.eventData->>'topic'", 'topic')
        .addSelect('COUNT(*)', 'count')
        .addSelect("AVG((ea.eventData->>'score')::float)", 'avgScore')
        .where("ea.eventName = 'quiz_complete'")
        .andWhere('ea.createdAt >= :since', { since })
        .groupBy("ea.eventData->>'topic'")
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),

      // Stats DLP
      this.repo
        .createQueryBuilder('ea')
        .select("ea.eventData->>'riskLevel'", 'riskLevel')
        .addSelect('COUNT(*)', 'count')
        .where("ea.eventName = 'dlp_analyze'")
        .andWhere('ea.createdAt >= :since', { since })
        .groupBy("ea.eventData->>'riskLevel'")
        .getRawMany(),
    ]);

    return {
      period: `${days} derniers jours`,
      totalEvents,
      uniqueSessions: parseInt(uniqueSessions?.count || '0', 10),
      eventBreakdown,
      dailyActivity,
      modeBreakdown,
      quiz: {
        topTopics: topQuizTopics,
        totalCompleted:
          eventBreakdown.find((e) => e.event === 'quiz_complete')?.count || 0,
      },
      dlp: {
        totalAnalyzed:
          eventBreakdown.find((e) => e.event === 'dlp_analyze')?.count || 0,
        byRiskLevel: dlpStats,
      },
    };
  }
}
