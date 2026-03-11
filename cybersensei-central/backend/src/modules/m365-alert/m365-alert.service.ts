import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { M365Alert, AlertType, AlertStatus } from '../../entities/m365-alert.entity';
import { M365Finding, FindingSeverity } from '../../entities/m365-finding.entity';
import { M365Score } from '../../entities/m365-score.entity';
import { Tenant } from '../../entities/tenant.entity';

@Injectable()
export class M365AlertService {
  private readonly logger = new Logger(M365AlertService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(M365Alert)
    private alertRepo: Repository<M365Alert>,
    @InjectRepository(M365Finding)
    private findingRepo: Repository<M365Finding>,
    @InjectRepository(M365Score)
    private scoreRepo: Repository<M365Score>,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  async detectAlerts(
    tenantId: string,
    currentScanId: string,
    previousScanId?: string,
  ): Promise<M365Alert[]> {
    const alerts: M365Alert[] = [];
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    const recipientEmail = tenant?.contactEmail;

    // Get current score
    const currentScore = await this.scoreRepo.findOne({
      where: { scanId: currentScanId },
    });

    // Score degradation
    if (currentScore?.previousScore != null && currentScore.scoreDelta != null) {
      if (currentScore.scoreDelta <= -10) {
        alerts.push(
          this.alertRepo.create({
            tenantId,
            scanId: currentScanId,
            type: AlertType.SCORE_DEGRADATION,
            status: AlertStatus.PENDING,
            title: `Score en baisse: ${currentScore.previousGrade} → ${currentScore.globalGrade}`,
            message: `Le score de securite a baisse de ${Math.abs(currentScore.scoreDelta)} points (${currentScore.previousScore} → ${currentScore.globalScore}).`,
            severity: currentScore.scoreDelta <= -20 ? 'CRITICAL' : 'HIGH',
            details: {
              previousScore: currentScore.previousScore,
              currentScore: currentScore.globalScore,
              delta: currentScore.scoreDelta,
            },
            recipientEmail,
          }),
        );
      }
    }

    // New critical findings
    const currentFindings = await this.findingRepo.find({
      where: { scanId: currentScanId, severity: FindingSeverity.CRITICAL },
    });

    let previousCheckIds = new Set<string>();
    if (previousScanId) {
      const prevFindings = await this.findingRepo.find({
        where: { scanId: previousScanId, severity: FindingSeverity.CRITICAL },
      });
      previousCheckIds = new Set(prevFindings.map((f) => f.checkId + ':' + (f.resource || '')));
    }

    for (const finding of currentFindings) {
      const key = finding.checkId + ':' + (finding.resource || '');
      if (!previousCheckIds.has(key)) {
        const alertType = this.mapFindingToAlertType(finding.checkId);
        alerts.push(
          this.alertRepo.create({
            tenantId,
            scanId: currentScanId,
            type: alertType,
            status: AlertStatus.PENDING,
            title: `Nouveau probleme critique: ${finding.title}`,
            message: finding.description,
            severity: 'CRITICAL',
            details: { findingId: finding.id, checkId: finding.checkId, resource: finding.resource },
            recipientEmail,
          }),
        );
      }
    }

    // Save all alerts
    if (alerts.length > 0) {
      await this.alertRepo.save(alerts);
      this.logger.log(`${alerts.length} alert(s) created for tenant ${tenantId}`);

      // Send email notifications
      for (const alert of alerts) {
        await this.sendEmailNotification(alert);
      }
    }

    return alerts;
  }

  private mapFindingToAlertType(checkId: string): AlertType {
    if (checkId.includes('MFA')) return AlertType.MFA_DISABLED;
    if (checkId.includes('ADMIN')) return AlertType.NEW_ADMIN;
    if (checkId.includes('FORWARDING')) return AlertType.NEW_FORWARDING_RULE;
    if (checkId.includes('SHARE') || checkId.includes('ANONYMOUS')) return AlertType.NEW_PUBLIC_SHARE;
    if (checkId.includes('OAUTH')) return AlertType.NEW_OAUTH_APP;
    return AlertType.NEW_CRITICAL_FINDING;
  }

  private async sendEmailNotification(alert: M365Alert): Promise<void> {
    if (!alert.recipientEmail) {
      this.logger.warn(`No recipient email for alert ${alert.id}`);
      return;
    }

    const smtpHost = this.configService.get<string>('SMTP_HOST');
    if (!smtpHost) {
      this.logger.warn('SMTP not configured, skipping email notification');
      return;
    }

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@cybersensei.io',
        to: alert.recipientEmail,
        subject: `[Cyber Sensei] ${alert.title}`,
        html: `
          <h2 style="color: ${alert.severity === 'CRITICAL' ? '#dc2626' : '#f97316'};">${alert.title}</h2>
          <p>${alert.message}</p>
          <p style="color: #6b7280; font-size: 12px;">Cette alerte a ete generee automatiquement par Cyber Sensei.</p>
        `,
      });

      await this.alertRepo.update(alert.id, {
        status: AlertStatus.SENT,
        sentAt: new Date(),
      });

      this.logger.log(`Email notification sent to ${alert.recipientEmail} for alert ${alert.id}`);
    } catch (err) {
      this.logger.error(`Failed to send email for alert ${alert.id}: ${err.message}`);
      await this.alertRepo.update(alert.id, { status: AlertStatus.FAILED });
    }
  }

  async retryFailedAlerts(): Promise<number> {
    const failedAlerts = await this.alertRepo.find({
      where: { status: AlertStatus.FAILED },
    });

    let retried = 0;
    for (const alert of failedAlerts) {
      await this.sendEmailNotification(alert);
      retried++;
    }
    return retried;
  }

  async getAlerts(
    tenantId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ alerts: M365Alert[]; total: number }> {
    const [alerts, total] = await this.alertRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { alerts, total };
  }

  async acknowledgeAlert(alertId: string): Promise<M365Alert> {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    return this.alertRepo.save(alert);
  }
}
