import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll, graphGet } from './graph-helper';

@Injectable()
export class PasswordPolicyCollector implements ICollector {
  private readonly logger = new Logger(PasswordPolicyCollector.name);
  readonly category = FindingCategory.PASSWORD_POLICY;
  readonly name = 'Password Policy Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Check organization settings
      const orgs = await graphGetAll<any>(accessToken, '/organization', apiCalls);

      if (orgs.length > 0) {
        const org = orgs[0];

        // Check password policies on domains
        const domains = await graphGetAll<any>(accessToken, '/domains', apiCalls);
        const verifiedDomains = domains.filter((d) => d.isVerified);

        for (const domain of verifiedDomains) {
          if (domain.passwordValidityPeriodInDays === 2147483647 || domain.passwordValidityPeriodInDays === 0) {
            // Passwords never expire — Microsoft now recommends this WITH MFA
            findings.push({
              checkId: 'PASSWORD_NEVER_EXPIRES',
              category: FindingCategory.PASSWORD_POLICY,
              severity: FindingSeverity.INFO,
              title: `Mots de passe sans expiration: ${domain.id}`,
              description: `Les mots de passe du domaine ${domain.id} n'expirent pas. Ceci est acceptable si le MFA est active pour tous les utilisateurs (recommandation NIST).`,
              resource: domain.id,
              resourceType: 'Domain',
              currentValue: { passwordValidityDays: domain.passwordValidityPeriodInDays },
              remediation: 'Acceptable si MFA active. Sinon, configurer une expiration de 90 jours.',
            });
          } else if (domain.passwordValidityPeriodInDays > 90) {
            findings.push({
              checkId: 'PASSWORD_LONG_EXPIRY',
              category: FindingCategory.PASSWORD_POLICY,
              severity: FindingSeverity.MEDIUM,
              title: `Expiration mot de passe longue: ${domain.id}`,
              description: `Les mots de passe du domaine ${domain.id} expirent apres ${domain.passwordValidityPeriodInDays} jours. Sans MFA, une expiration > 90 jours augmente le risque.`,
              resource: domain.id,
              resourceType: 'Domain',
              currentValue: { passwordValidityDays: domain.passwordValidityPeriodInDays },
              expectedValue: { maxDays: 90 },
              remediation: 'Reduire la duree d\'expiration a 90 jours ou activer le MFA pour tous les utilisateurs.',
            });
          }

          if (domain.passwordNotificationWindowInDays < 14) {
            findings.push({
              checkId: 'PASSWORD_NOTIFICATION_SHORT',
              category: FindingCategory.PASSWORD_POLICY,
              severity: FindingSeverity.LOW,
              title: `Notification expiration courte: ${domain.id}`,
              description: `Les utilisateurs sont notifies ${domain.passwordNotificationWindowInDays} jours avant l'expiration. Un delai de 14 jours minimum est recommande.`,
              resource: domain.id,
              resourceType: 'Domain',
              currentValue: { notificationDays: domain.passwordNotificationWindowInDays },
              expectedValue: { minDays: 14 },
              remediation: 'Augmenter le delai de notification a 14 jours.',
            });
          }
        }

        // Check self-service password reset
        // Note: SSPR status is not directly available via Graph API for all tenants
        // We check organization settings as a proxy
        if (org.onPremisesSyncEnabled) {
          findings.push({
            checkId: 'HYBRID_SYNC_ENABLED',
            category: FindingCategory.PASSWORD_POLICY,
            severity: FindingSeverity.INFO,
            title: 'Synchronisation Active Directory hybride active',
            description: 'Le tenant utilise une synchronisation hybride AD. Les politiques de mot de passe locales s\'appliquent egalement.',
            currentValue: { hybridSync: true },
            remediation: 'Verifier que les politiques de mot de passe on-premise sont alignees avec les bonnes pratiques.',
          });
        }
      }
    } catch (err) {
      this.logger.error('Password policy collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
