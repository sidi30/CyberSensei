import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { M365Connection } from '../../entities/m365-connection.entity';
import { M365Scan } from '../../entities/m365-scan.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365ScanService } from '../m365-scan/m365-scan.service';
import { M365ScoreService } from '../m365-score/m365-score.service';
import { M365AlertService } from '../m365-alert/m365-alert.service';
import { M365TokenService } from '../m365-auth/m365-token.service';
import { ScanTrigger } from '../../entities/m365-scan.entity';

@Injectable()
export class M365SchedulerService {
  private readonly logger = new Logger(M365SchedulerService.name);

  constructor(
    @InjectRepository(M365Connection)
    private connectionRepo: Repository<M365Connection>,
    @InjectRepository(M365Scan)
    private scanRepo: Repository<M365Scan>,
    @InjectRepository(M365Finding)
    private findingRepo: Repository<M365Finding>,
    private scanService: M365ScanService,
    private scoreService: M365ScoreService,
    private alertService: M365AlertService,
    private tokenService: M365TokenService,
  ) {}

  // Daily scan at 2:00 AM
  @Cron('0 2 * * *')
  async scheduledDailyScan(): Promise<void> {
    this.logger.log('Starting scheduled daily scans');

    const activeConnections = await this.connectionRepo.find({
      where: { isActive: true },
    });

    for (const connection of activeConnections) {
      try {
        this.logger.log(`Starting scheduled scan for tenant ${connection.tenantId}`);

        // Get previous scan for alert comparison
        let previousScanId: string | undefined;
        try {
          const previousScan = await this.scanService.getLatestScan(connection.tenantId);
          previousScanId = previousScan.id;
        } catch {
          // No previous scan
        }

        const scan = await this.scanService.triggerScan(
          connection.tenantId,
          ScanTrigger.SCHEDULED,
        );

        // Wait for scan to complete (poll with timeout)
        const maxWaitMs = 5 * 60 * 1000; // 5 minutes
        const startWait = Date.now();
        let scanResult = await this.scanRepo.findOne({ where: { id: scan.id } });

        while (
          scanResult &&
          ['PENDING', 'IN_PROGRESS'].includes(scanResult.status) &&
          Date.now() - startWait < maxWaitMs
        ) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          scanResult = await this.scanRepo.findOne({ where: { id: scan.id } });
        }

        if (scanResult && ['COMPLETED', 'PARTIAL'].includes(scanResult.status)) {
          // Calculate score
          await this.scoreService.calculateScore(scan.id, connection.tenantId);

          // Detect alerts
          await this.alertService.detectAlerts(
            connection.tenantId,
            scan.id,
            previousScanId,
          );

          this.logger.log(`Scheduled scan completed for tenant ${connection.tenantId}`);
        } else {
          this.logger.warn(`Scheduled scan timed out or failed for tenant ${connection.tenantId}`);
        }
      } catch (err) {
        this.logger.error(`Scheduled scan failed for tenant ${connection.tenantId}: ${err.message}`);
      }
    }
  }

  // Proactive token refresh every 30 minutes
  @Cron('*/30 * * * *')
  async proactiveTokenRefresh(): Promise<void> {
    const connections = await this.connectionRepo.find({
      where: { isActive: true },
    });

    const bufferMs = 15 * 60 * 1000; // Refresh if expiring within 15 min
    const now = Date.now();

    for (const connection of connections) {
      if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() < now + bufferMs) {
        try {
          await this.tokenService.requestNewToken(connection);
          this.logger.log(`Token proactively refreshed for tenant ${connection.tenantId}`);
        } catch (err) {
          this.logger.error(`Token refresh failed for tenant ${connection.tenantId}: ${err.message}`);
        }
      }
    }
  }

  // Cleanup old scans every Sunday at 3:00 AM
  @Cron('0 3 * * 0')
  async cleanupOldScans(): Promise<void> {
    this.logger.log('Starting old scan cleanup');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete old findings first (cascade would handle it, but explicit is clearer)
    const oldScans = await this.scanRepo.find({
      where: { createdAt: LessThan(ninetyDaysAgo) },
      select: ['id'],
    });

    if (oldScans.length > 0) {
      const scanIds = oldScans.map((s) => s.id);

      // Delete findings for old scans
      for (const scanId of scanIds) {
        await this.findingRepo.delete({ scanId });
      }

      // Delete old scans
      await this.scanRepo.delete(oldScans.map((s) => s.id));

      this.logger.log(`Cleaned up ${oldScans.length} old scan(s) and their findings`);
    }
  }

  // Retry failed alerts every 15 minutes
  @Cron('*/15 * * * *')
  async retryFailedAlerts(): Promise<void> {
    try {
      const retried = await this.alertService.retryFailedAlerts();
      if (retried > 0) {
        this.logger.log(`Retried ${retried} failed alert(s)`);
      }
    } catch (err) {
      this.logger.error(`Alert retry failed: ${err.message}`);
    }
  }
}
