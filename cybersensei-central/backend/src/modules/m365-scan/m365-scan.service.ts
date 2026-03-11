import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { M365Scan, ScanStatus, ScanTrigger } from '../../entities/m365-scan.entity';
import { M365Finding, FindingCategory } from '../../entities/m365-finding.entity';
import { M365Connection } from '../../entities/m365-connection.entity';
import { M365TokenService } from '../m365-auth/m365-token.service';
import { ICollector, CollectorResult } from './interfaces/collector.interface';
import { MfaCollector } from './collectors/mfa-collector';
import { AdminRolesCollector } from './collectors/admin-roles-collector';
import { EmailForwardingCollector } from './collectors/email-forwarding-collector';
import { SharingCollector } from './collectors/sharing-collector';
import { EmailSecurityCollector } from './collectors/email-security-collector';
import { OAuthAppsCollector } from './collectors/oauth-apps-collector';
import { PasswordPolicyCollector } from './collectors/password-policy-collector';
import { ConditionalAccessCollector } from './collectors/conditional-access-collector';
import { MailboxCollector } from './collectors/mailbox-collector';
import { SignInCollector } from './collectors/sign-in-collector';

@Injectable()
export class M365ScanService {
  private readonly logger = new Logger(M365ScanService.name);
  private readonly collectors: ICollector[];

  constructor(
    @InjectRepository(M365Scan)
    private scanRepo: Repository<M365Scan>,
    @InjectRepository(M365Finding)
    private findingRepo: Repository<M365Finding>,
    @InjectRepository(M365Connection)
    private connectionRepo: Repository<M365Connection>,
    private tokenService: M365TokenService,
    private mfaCollector: MfaCollector,
    private adminRolesCollector: AdminRolesCollector,
    private emailForwardingCollector: EmailForwardingCollector,
    private sharingCollector: SharingCollector,
    private emailSecurityCollector: EmailSecurityCollector,
    private oauthAppsCollector: OAuthAppsCollector,
    private passwordPolicyCollector: PasswordPolicyCollector,
    private conditionalAccessCollector: ConditionalAccessCollector,
    private mailboxCollector: MailboxCollector,
    private signInCollector: SignInCollector,
  ) {
    this.collectors = [
      mfaCollector,
      adminRolesCollector,
      emailForwardingCollector,
      sharingCollector,
      emailSecurityCollector,
      oauthAppsCollector,
      passwordPolicyCollector,
      conditionalAccessCollector,
      mailboxCollector,
      signInCollector,
    ];
  }

  async triggerScan(
    tenantId: string,
    trigger: ScanTrigger = ScanTrigger.MANUAL,
    categories?: FindingCategory[],
  ): Promise<M365Scan> {
    // Verify connection exists
    const connection = await this.connectionRepo.findOne({
      where: { tenantId, isActive: true },
    });

    if (!connection) {
      throw new NotFoundException(`No active M365 connection for tenant ${tenantId}`);
    }

    // Create scan record
    const scan = this.scanRepo.create({
      tenantId,
      status: ScanStatus.IN_PROGRESS,
      trigger,
      startedAt: new Date(),
    });
    await this.scanRepo.save(scan);

    // Run scan asynchronously
    this.executeScan(scan, connection, categories).catch((err) => {
      this.logger.error(`Scan ${scan.id} failed unexpectedly`, err);
    });

    return scan;
  }

  private async executeScan(
    scan: M365Scan,
    connection: M365Connection,
    categories?: FindingCategory[],
  ): Promise<void> {
    const startTime = Date.now();
    let totalApiCalls = 0;
    const completedCategories: string[] = [];
    const failedCategories: string[] = [];

    try {
      const accessToken = await this.tokenService.getValidAccessToken(scan.tenantId);
      const tenantDomain = connection.microsoftTenantDomain || '';

      // Filter collectors if categories specified
      const activeCollectors = categories
        ? this.collectors.filter((c) => categories.includes(c.category))
        : this.collectors;

      // Execute all collectors in parallel
      const results = await Promise.allSettled(
        activeCollectors.map((collector) =>
          collector.collect(accessToken, tenantDomain).then((result) => ({
            collector: collector.name,
            result,
          })),
        ),
      );

      const allFindings: M365Finding[] = [];

      for (const settled of results) {
        if (settled.status === 'fulfilled') {
          const { collector, result } = settled.value;
          totalApiCalls += result.apiCallsCount;

          if (result.error) {
            failedCategories.push(result.category);
            this.logger.warn(`Collector ${collector} completed with error: ${result.error}`);
          } else {
            completedCategories.push(result.category);
          }

          // Save findings
          for (const finding of result.findings) {
            const entity = this.findingRepo.create({
              ...finding,
              scanId: scan.id,
              tenantId: scan.tenantId,
            });
            allFindings.push(entity);
          }
        } else {
          this.logger.error(`Collector failed: ${settled.reason}`);
          failedCategories.push('UNKNOWN');
        }
      }

      // Bulk save findings
      if (allFindings.length > 0) {
        await this.findingRepo.save(allFindings);
      }

      // Count by severity
      const criticalFindings = allFindings.filter((f) => f.severity === 'CRITICAL').length;
      const highFindings = allFindings.filter((f) => f.severity === 'HIGH').length;
      const mediumFindings = allFindings.filter((f) => f.severity === 'MEDIUM').length;
      const lowFindings = allFindings.filter((f) => f.severity === 'LOW').length;
      const infoFindings = allFindings.filter((f) => f.severity === 'INFO').length;

      // Update scan record
      const durationMs = Date.now() - startTime;
      await this.scanRepo.update(scan.id, {
        status: failedCategories.length > 0 ? ScanStatus.PARTIAL : ScanStatus.COMPLETED,
        completedAt: new Date(),
        durationMs,
        totalFindings: allFindings.length,
        criticalFindings,
        highFindings,
        mediumFindings,
        lowFindings,
        infoFindings,
        apiCallsCount: totalApiCalls,
        categories: completedCategories,
        failedCategories: failedCategories.length > 0 ? failedCategories : null,
      });

      // Update connection lastScanAt
      await this.connectionRepo.update(connection.id, { lastScanAt: new Date() });

      this.logger.log(
        `Scan ${scan.id} completed: ${allFindings.length} findings, ${durationMs}ms, ${totalApiCalls} API calls`,
      );
    } catch (err) {
      this.logger.error(`Scan ${scan.id} failed`, err);
      await this.scanRepo.update(scan.id, {
        status: ScanStatus.FAILED,
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
        errorMessage: err.message,
        categories: completedCategories,
        failedCategories,
      });
    }
  }

  async getScan(scanId: string): Promise<M365Scan> {
    const scan = await this.scanRepo.findOne({
      where: { id: scanId },
      relations: ['findings'],
    });
    if (!scan) {
      throw new NotFoundException(`Scan ${scanId} not found`);
    }
    return scan;
  }

  async getLatestScan(tenantId: string): Promise<M365Scan> {
    const scan = await this.scanRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['findings'],
    });
    if (!scan) {
      throw new NotFoundException(`No scans found for tenant ${tenantId}`);
    }
    return scan;
  }

  async getScanHistory(
    tenantId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ scans: M365Scan[]; total: number }> {
    const [scans, total] = await this.scanRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { scans, total };
  }

  async getScanFindings(
    scanId: string,
    category?: FindingCategory,
    severity?: string,
    limit = 50,
    offset = 0,
  ): Promise<{ findings: M365Finding[]; total: number }> {
    const where: any = { scanId };
    if (category) where.category = category;
    if (severity) where.severity = severity;

    const [findings, total] = await this.findingRepo.findAndCount({
      where,
      order: { severity: 'ASC', category: 'ASC' },
      take: limit,
      skip: offset,
    });

    return { findings, total };
  }
}
