import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import { promisify } from 'util';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

const resolveTxt = promisify(dns.resolveTxt);

@Injectable()
export class EmailSecurityCollector implements ICollector {
  private readonly logger = new Logger(EmailSecurityCollector.name);
  readonly category = FindingCategory.EMAIL_SECURITY;
  readonly name = 'Email Security Collector';

  async collect(accessToken: string, tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Get verified domains
      const domains = await graphGetAll<any>(accessToken, '/domains', apiCalls);
      const verifiedDomains = domains.filter((d) => d.isVerified);

      for (const domain of verifiedDomains) {
        const domainName = domain.id;

        // Check SPF
        try {
          const txtRecords = await resolveTxt(domainName);
          const flatRecords = txtRecords.map((r) => r.join(''));
          const spfRecord = flatRecords.find((r) => r.startsWith('v=spf1'));

          if (!spfRecord) {
            findings.push({
              checkId: 'SPF_MISSING',
              category: FindingCategory.EMAIL_SECURITY,
              severity: FindingSeverity.HIGH,
              title: `SPF manquant: ${domainName}`,
              description: `Aucun enregistrement SPF trouve pour ${domainName}. Sans SPF, des attaquants peuvent usurper des emails depuis ce domaine.`,
              resource: domainName,
              resourceType: 'Domain',
              currentValue: { spf: null },
              expectedValue: { spf: 'v=spf1 include:spf.protection.outlook.com -all' },
              remediation: `Ajouter un enregistrement TXT SPF pour ${domainName}: "v=spf1 include:spf.protection.outlook.com -all"`,
            });
          } else if (!spfRecord.includes('-all') && !spfRecord.includes('~all')) {
            findings.push({
              checkId: 'SPF_PERMISSIVE',
              category: FindingCategory.EMAIL_SECURITY,
              severity: FindingSeverity.MEDIUM,
              title: `SPF permissif: ${domainName}`,
              description: `L'enregistrement SPF de ${domainName} n'utilise pas "-all" ou "~all". Des emails non autorises pourraient ne pas etre rejetes.`,
              resource: domainName,
              resourceType: 'Domain',
              currentValue: { spf: spfRecord },
              expectedValue: { spfEnding: '-all' },
              remediation: `Modifier l'enregistrement SPF pour terminer par "-all" au lieu de "+all" ou "?all".`,
            });
          }

          // Check DMARC
          try {
            const dmarcRecords = await resolveTxt(`_dmarc.${domainName}`);
            const dmarcFlat = dmarcRecords.map((r) => r.join(''));
            const dmarcRecord = dmarcFlat.find((r) => r.startsWith('v=DMARC1'));

            if (!dmarcRecord) {
              findings.push({
                checkId: 'DMARC_MISSING',
                category: FindingCategory.EMAIL_SECURITY,
                severity: FindingSeverity.HIGH,
                title: `DMARC manquant: ${domainName}`,
                description: `Aucun enregistrement DMARC trouve pour ${domainName}. DMARC protege contre le phishing et l'usurpation d'identite.`,
                resource: domainName,
                resourceType: 'Domain',
                currentValue: { dmarc: null },
                expectedValue: { dmarc: 'v=DMARC1; p=reject; rua=mailto:dmarc@' + domainName },
                remediation: `Ajouter un enregistrement TXT DMARC: "_dmarc.${domainName}" avec la valeur "v=DMARC1; p=quarantine; rua=mailto:dmarc@${domainName}"`,
              });
            } else if (dmarcRecord.includes('p=none')) {
              findings.push({
                checkId: 'DMARC_NOT_ENFORCED',
                category: FindingCategory.EMAIL_SECURITY,
                severity: FindingSeverity.MEDIUM,
                title: `DMARC non applique: ${domainName}`,
                description: `Le DMARC de ${domainName} est en mode "none" (surveillance uniquement). Les emails frauduleux ne sont pas bloques.`,
                resource: domainName,
                resourceType: 'Domain',
                currentValue: { dmarc: dmarcRecord, policy: 'none' },
                expectedValue: { policy: 'quarantine or reject' },
                remediation: 'Passer la politique DMARC de "p=none" a "p=quarantine" puis "p=reject" apres validation.',
              });
            }
          } catch {
            findings.push({
              checkId: 'DMARC_MISSING',
              category: FindingCategory.EMAIL_SECURITY,
              severity: FindingSeverity.HIGH,
              title: `DMARC manquant: ${domainName}`,
              description: `Aucun enregistrement DMARC trouve pour ${domainName}.`,
              resource: domainName,
              resourceType: 'Domain',
              currentValue: { dmarc: null },
              remediation: `Ajouter un enregistrement DMARC pour ${domainName}.`,
            });
          }

          // Check DKIM (selector1 and selector2 for M365)
          for (const selector of ['selector1', 'selector2']) {
            try {
              await resolveTxt(`${selector}._domainkey.${domainName}`);
              // DKIM found — good
            } catch {
              findings.push({
                checkId: 'DKIM_MISSING',
                category: FindingCategory.EMAIL_SECURITY,
                severity: FindingSeverity.MEDIUM,
                title: `DKIM ${selector} manquant: ${domainName}`,
                description: `L'enregistrement DKIM "${selector}" n'est pas configure pour ${domainName}. DKIM valide l'integrite des emails.`,
                resource: domainName,
                resourceType: 'Domain',
                currentValue: { dkim: null, selector },
                remediation: `Activer DKIM pour ${domainName} dans le centre d'administration Exchange > Protection > DKIM.`,
              });
              break; // Only report once per domain
            }
          }
        } catch (dnsErr) {
          this.logger.warn(`DNS lookup failed for ${domainName}: ${dnsErr.message}`);
        }
      }
    } catch (err) {
      this.logger.error('Email security collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
