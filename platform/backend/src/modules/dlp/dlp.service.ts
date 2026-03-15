import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DlpPromptEvent, RiskLevel } from '../../entities/dlp-prompt-event.entity';
import { DlpRiskDetection } from '../../entities/dlp-risk-detection.entity';
import { DlpAlert, AlertSeverity, AlertStatus } from '../../entities/dlp-alert.entity';
import * as crypto from 'crypto';

@Injectable()
export class DlpService {
  private readonly logger = new Logger(DlpService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(DlpPromptEvent)
    private promptEventRepo: Repository<DlpPromptEvent>,
    @InjectRepository(DlpRiskDetection)
    private riskDetectionRepo: Repository<DlpRiskDetection>,
    @InjectRepository(DlpAlert)
    private alertRepo: Repository<DlpAlert>,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SECURITY_URL', 'http://ai-service:8000');
  }

  async analyzePrompt(
    tenantId: string,
    userId: string,
    prompt: string,
    aiTool: string,
    sourceUrl?: string,
  ): Promise<{
    eventId: string;
    riskScore: number;
    riskLevel: RiskLevel;
    blocked: boolean;
    detections: any[];
  }> {
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex');

    // Call AI service for analysis
    let analysisResult: any = { risk_score: 0, risk_level: 'SAFE', detections: [], blocked: false };
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, source: sourceUrl }),
      });
      if (response.ok) {
        analysisResult = await response.json();
      }
    } catch (error) {
      this.logger.warn(`AI service unavailable, using fallback: ${error.message}`);
    }

    const riskLevel = this.mapRiskLevel(analysisResult.risk_score);
    const blocked = analysisResult.risk_score >= 80;
    const containsArticle9 = analysisResult.article9?.has_article9_data ?? false;

    // Calculate retention expiry
    const retentionDays = containsArticle9 ? 30 : 90;
    const retentionExpiresAt = new Date();
    retentionExpiresAt.setDate(retentionExpiresAt.getDate() + retentionDays);

    // Save prompt event
    const event = this.promptEventRepo.create({
      tenantId,
      userId,
      promptHash,
      riskScore: analysisResult.risk_score,
      riskLevel,
      aiTool: aiTool as any,
      blocked,
      sourceUrl,
      containsArticle9,
      retentionExpiresAt,
    });
    const savedEvent = await this.promptEventRepo.save(event);

    // Save detections
    const detections = analysisResult.detections || [];
    for (const detection of detections) {
      const riskDetection = this.riskDetectionRepo.create({
        promptEventId: savedEvent.id,
        category: detection.category,
        confidence: detection.confidence,
        method: detection.method,
        snippetRedacted: detection.snippet_redacted,
      });
      await this.riskDetectionRepo.save(riskDetection);
    }

    // Create alert if HIGH or CRITICAL
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
      const alert = this.alertRepo.create({
        tenantId,
        title: `${riskLevel} risk prompt detected on ${aiTool}`,
        description: `User ${userId} submitted a ${riskLevel} risk prompt. Risk score: ${analysisResult.risk_score}/100. ${detections.length} sensitive data categories detected.`,
        severity: riskLevel === RiskLevel.CRITICAL ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        promptEventId: savedEvent.id,
      });
      await this.alertRepo.save(alert);
    }

    return {
      eventId: savedEvent.id,
      riskScore: analysisResult.risk_score,
      riskLevel,
      blocked,
      detections,
    };
  }

  private mapRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 40) return RiskLevel.MEDIUM;
    if (score >= 20) return RiskLevel.LOW;
    return RiskLevel.SAFE;
  }

  async getAlerts(tenantId: string, status?: AlertStatus) {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.alertRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async resolveAlert(alertId: string) {
    return this.alertRepo.update(alertId, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
    });
  }

  async dismissAlert(alertId: string) {
    return this.alertRepo.update(alertId, {
      status: AlertStatus.DISMISSED,
    });
  }

  async getStats(tenantId: string, startDate?: Date, endDate?: Date) {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const totalEvents = await this.promptEventRepo.count({ where });
    const blockedEvents = await this.promptEventRepo.count({ where: { ...where, blocked: true } });
    const highRiskEvents = await this.promptEventRepo.count({
      where: [
        { ...where, riskLevel: RiskLevel.HIGH },
        { ...where, riskLevel: RiskLevel.CRITICAL },
      ],
    });
    const openAlerts = await this.alertRepo.count({
      where: { tenantId, status: AlertStatus.OPEN },
    });

    return {
      totalEvents,
      blockedEvents,
      highRiskEvents,
      openAlerts,
      blockRate: totalEvents > 0 ? Math.round((blockedEvents / totalEvents) * 100) : 0,
    };
  }

  async getRecentEvents(tenantId: string, limit = 20) {
    return this.promptEventRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
