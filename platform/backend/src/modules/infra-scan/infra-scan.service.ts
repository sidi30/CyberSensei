import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ScanHistory, ScanHistoryStatus, ScanTriggerType } from '../../entities/scan-history.entity';

@Injectable()
export class InfraScanService {
  private readonly logger = new Logger(InfraScanService.name);
  private readonly scannerUrl: string;

  constructor(
    @InjectRepository(ScanHistory)
    private scanHistoryRepo: Repository<ScanHistory>,
    private configService: ConfigService,
  ) {
    this.scannerUrl = this.configService.get<string>('SCANNER_URL', 'http://scanner:8003');
  }

  async launchScan(
    tenantId: string,
    domain: string,
    emails: string[] = [],
    trigger: ScanTriggerType = ScanTriggerType.MANUAL,
  ): Promise<ScanHistory> {
    // Get previous scan for delta calculation
    const previousScan = await this.scanHistoryRepo.findOne({
      where: { tenantId, domain, status: ScanHistoryStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });

    // Create scan record
    const scanRecord = this.scanHistoryRepo.create({
      tenantId,
      domain,
      status: ScanHistoryStatus.IN_PROGRESS,
      trigger,
      previousScore: previousScan?.score ?? null,
    });
    const saved = await this.scanHistoryRepo.save(scanRecord);

    // Call scanner API
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.scannerUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, emails }),
      });

      if (!response.ok) {
        throw new Error(`Scanner returned ${response.status}`);
      }

      const result = await response.json();
      const durationMs = Date.now() - startTime;

      // Calculate delta and detect new/resolved risks
      const { newRisks, resolvedRisks } = this.computeRiskChanges(
        previousScan?.details,
        result.details,
      );

      // Update scan record
      await this.scanHistoryRepo.update(saved.id, {
        score: result.score,
        deltaScore: previousScan ? result.score - previousScan.score : null,
        status: ScanHistoryStatus.COMPLETED,
        details: result.details,
        newRisks,
        resolvedRisks,
        durationMs,
      });

      return this.scanHistoryRepo.findOne({ where: { id: saved.id } });
    } catch (error) {
      const durationMs = Date.now() - startTime;
      await this.scanHistoryRepo.update(saved.id, {
        status: ScanHistoryStatus.FAILED,
        errorMessage: error.message,
        durationMs,
      });
      this.logger.error(`Scan failed for ${domain}: ${error.message}`);
      throw error;
    }
  }

  private computeRiskChanges(
    previousDetails: Record<string, any> | null,
    currentDetails: Record<string, any>,
  ): { newRisks: string[]; resolvedRisks: string[] } {
    if (!previousDetails) {
      return { newRisks: [], resolvedRisks: [] };
    }

    const newRisks: string[] = [];
    const resolvedRisks: string[] = [];

    // Check for new critical ports
    const prevPorts = new Set(
      (previousDetails.nmap?.critical_ports || []).map((p: any) => String(p.port)),
    );
    const currPorts = new Set(
      (currentDetails.nmap?.critical_ports || []).map((p: any) => String(p.port)),
    );
    for (const port of currPorts) {
      if (!prevPorts.has(port)) newRisks.push(`New critical port exposed: ${port}`);
    }
    for (const port of prevPorts) {
      if (!currPorts.has(port)) resolvedRisks.push(`Critical port closed: ${port}`);
    }

    // Check TLS changes
    if (!previousDetails.testssl?.has_weak_tls && currentDetails.testssl?.has_weak_tls) {
      newRisks.push('Weak TLS detected');
    }
    if (previousDetails.testssl?.has_weak_tls && !currentDetails.testssl?.has_weak_tls) {
      resolvedRisks.push('Weak TLS resolved');
    }

    return { newRisks, resolvedRisks };
  }

  async getScanHistory(tenantId: string, limit = 20) {
    return this.scanHistoryRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getScanById(scanId: string) {
    const scan = await this.scanHistoryRepo.findOne({ where: { id: scanId } });
    if (!scan) throw new NotFoundException(`Scan ${scanId} not found`);
    return scan;
  }

  async getLatestScan(tenantId: string, domain: string) {
    return this.scanHistoryRepo.findOne({
      where: { tenantId, domain, status: ScanHistoryStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });
  }
}
