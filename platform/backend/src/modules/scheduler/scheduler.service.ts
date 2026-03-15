import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import {
  ScanHistory,
  ScanHistoryStatus,
  ScanTriggerType,
} from '../../entities/scan-history.entity';
import { AlertService, ScanAlertData } from './alert.service';

/**
 * Interface de réponse du microservice cybersensei-scanner.
 */
interface ScannerResponse {
  domain: string;
  score: number;
  details: Record<string, any>;
  timestamp: string;
}

/**
 * Scheduler multi-tenant pour les scans de sécurité.
 *
 * Déclenche des scans périodiques pour chaque tenant actif
 * via le microservice cybersensei-scanner, avec file d'attente
 * limitée à 5 scans simultanés pour éviter la surcharge.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly scannerUrl: string;
  private readonly maxConcurrent = 5;

  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(ScanHistory)
    private scanHistoryRepo: Repository<ScanHistory>,
    private alertService: AlertService,
    private configService: ConfigService,
  ) {
    this.scannerUrl = this.configService.get<string>(
      'SCANNER_SERVICE_URL',
      'http://cybersensei-scanner:8000',
    );
    this.logger.log(`Scheduler initialisé — scanner URL: ${this.scannerUrl}`);
  }

  /**
   * Scan quotidien à 02h30 pour tous les tenants actifs.
   */
  @Cron('0 0 2 * * *')
  async scheduledDailyScan(): Promise<void> {
    this.logger.log('=== Démarrage des scans quotidiens multi-tenant ===');
    await this.runScansForAllTenants(ScanTriggerType.SCHEDULED_DAILY);
  }

  /**
   * Scan hebdomadaire le lundi à 03h30 pour tous les tenants actifs.
   */
  @Cron('0 0 3 * * 1')
  async scheduledWeeklyScan(): Promise<void> {
    this.logger.log('=== Démarrage des scans hebdomadaires multi-tenant ===');
    await this.runScansForAllTenants(ScanTriggerType.SCHEDULED_WEEKLY);
  }

  /**
   * Orchestre les scans pour tous les tenants actifs avec file d'attente.
   */
  private async runScansForAllTenants(
    triggerType: ScanTriggerType,
  ): Promise<void> {
    const tenants = await this.tenantRepo.find({
      where: { active: true },
    });

    if (tenants.length === 0) {
      this.logger.log('Aucun tenant actif — scans ignorés');
      return;
    }

    this.logger.log(
      `${tenants.length} tenant(s) actif(s) à scanner (concurrence max: ${this.maxConcurrent})`,
    );

    // File d'attente : traiter par batchs de maxConcurrent
    for (let i = 0; i < tenants.length; i += this.maxConcurrent) {
      const batch = tenants.slice(i, i + this.maxConcurrent);
      const batchNum = Math.floor(i / this.maxConcurrent) + 1;

      this.logger.log(
        `Batch ${batchNum} — ${batch.length} scan(s) en parallèle`,
      );

      await Promise.allSettled(
        batch.map((tenant) => this.scanTenant(tenant, triggerType)),
      );
    }

    this.logger.log('=== Tous les scans programmés terminés ===');
  }

  /**
   * Exécute un scan pour un tenant donné.
   */
  private async scanTenant(
    tenant: Tenant,
    triggerType: ScanTriggerType,
  ): Promise<void> {
    const domain = tenant.name; // le name du tenant est utilisé comme domaine

    // Créer l'entrée d'historique
    const history = this.scanHistoryRepo.create({
      tenantId: tenant.id,
      domain,
      status: ScanHistoryStatus.IN_PROGRESS,
      trigger: triggerType,
    });
    const saved = await this.scanHistoryRepo.save(history);
    const startTime = Date.now();

    try {
      this.logger.log(
        `Scan ${triggerType} pour tenant ${tenant.id} (${domain})`,
      );

      // Récupérer le scan précédent pour comparaison
      const previousScan = await this.scanHistoryRepo.findOne({
        where: {
          tenantId: tenant.id,
          status: ScanHistoryStatus.COMPLETED,
        },
        order: { createdAt: 'DESC' },
      });

      // Appeler le microservice scanner
      const response = await this.callScanner(domain);

      // Mettre à jour l'historique
      saved.score = response.score;
      saved.details = response.details;
      saved.status = ScanHistoryStatus.COMPLETED;
      saved.durationMs = Date.now() - startTime;

      // Calculer le diff
      if (previousScan?.score != null) {
        saved.previousScore = previousScan.score;
        saved.deltaScore = response.score - previousScan.score;

        const { newRisks, resolvedRisks } = this.compareScans(
          previousScan.details || {},
          response.details,
        );
        saved.newRisks = newRisks;
        saved.resolvedRisks = resolvedRisks;

        // Déclencher les alertes
        const alertData: ScanAlertData = {
          tenantId: tenant.id,
          tenantName: tenant.name,
          contactEmail: tenant.contactEmail,
          domain,
          currentScore: response.score,
          previousScore: previousScan.score,
          deltaScore: saved.deltaScore,
          newRisks,
          resolvedRisks,
        };

        await this.alertService.processAlerts(alertData);
      }

      await this.scanHistoryRepo.save(saved);

      this.logger.log(
        `Scan terminé pour ${domain} — score: ${response.score}/100 (${saved.durationMs}ms)`,
      );
    } catch (err) {
      saved.status = ScanHistoryStatus.FAILED;
      saved.errorMessage = err.message;
      saved.durationMs = Date.now() - startTime;
      await this.scanHistoryRepo.save(saved);

      this.logger.error(
        `Scan échoué pour tenant ${tenant.id} (${domain}): ${err.message}`,
      );
    }
  }

  /**
   * Appelle le microservice cybersensei-scanner via HTTP.
   */
  private async callScanner(domain: string): Promise<ScannerResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 min

    try {
      const response = await fetch(`${this.scannerUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, emails: [] }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Scanner HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as ScannerResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Compare deux scans pour détecter les nouveaux risques et les risques résolus.
   */
  private compareScans(
    previousDetails: Record<string, any>,
    currentDetails: Record<string, any>,
  ): { newRisks: string[]; resolvedRisks: string[] } {
    const previousRisks = new Set(this.extractRisks(previousDetails));
    const currentRisks = new Set(this.extractRisks(currentDetails));

    const newRisks = [...currentRisks].filter((r) => !previousRisks.has(r));
    const resolvedRisks = [...previousRisks].filter(
      (r) => !currentRisks.has(r),
    );

    return { newRisks, resolvedRisks };
  }

  /**
   * Extrait les identifiants de risque à partir des détails d'un scan.
   */
  private extractRisks(details: Record<string, any>): string[] {
    const risks: string[] = [];

    // Ports critiques
    const nmap = details?.nmap;
    if (nmap && !nmap.skipped) {
      for (const p of nmap.critical_ports || []) {
        risks.push(`port:${p.port}`);
      }
    }

    // CVE
    const nuclei = details?.nuclei;
    if (nuclei && !nuclei.skipped) {
      for (const v of nuclei.vulnerabilities || []) {
        for (const cve of v.cve_ids || []) {
          risks.push(`cve:${cve}`);
        }
      }
    }

    // TLS
    const testssl = details?.testssl;
    if (testssl && !testssl.skipped) {
      if (testssl.has_weak_tls) risks.push('tls:weak_protocol');
      if (testssl.cert_expired) risks.push('tls:cert_expired');
    }

    // Typosquats
    const dnstwist = details?.dnstwist;
    if (dnstwist && !dnstwist.skipped) {
      for (const ts of dnstwist.active_typosquats || []) {
        risks.push(`typosquat:${ts.domain}`);
      }
    }

    // Emails compromis
    const hibp = details?.hibp;
    if (hibp && !hibp.skipped) {
      for (const r of hibp.results || []) {
        if (r.breached) risks.push(`breach:${r.email}`);
      }
    }

    // AbuseIPDB
    const abuse = details?.abuseipdb;
    if (abuse && !abuse.skipped && abuse.is_blacklisted) {
      risks.push('abuseipdb:blacklisted');
    }

    return risks;
  }
}
