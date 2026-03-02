import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

@Injectable()
export class ConditionalAccessCollector implements ICollector {
  private readonly logger = new Logger(ConditionalAccessCollector.name);
  readonly category = FindingCategory.CONDITIONAL_ACCESS;
  readonly name = 'Conditional Access Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      let policies: any[] = [];
      try {
        policies = await graphGetAll<any>(
          accessToken,
          '/identity/conditionalAccess/policies',
          apiCalls,
        );
      } catch (err) {
        // Conditional Access requires Azure AD P1 license
        if (err.message?.includes('404') || err.message?.includes('403')) {
          findings.push({
            checkId: 'CONDITIONAL_ACCESS_NOT_AVAILABLE',
            category: FindingCategory.CONDITIONAL_ACCESS,
            severity: FindingSeverity.MEDIUM,
            title: 'Acces conditionnel non disponible',
            description: 'L\'acces conditionnel Azure AD n\'est pas disponible. Cette fonctionnalite requiert une licence Azure AD Premium P1 ou P2.',
            currentValue: { available: false },
            expectedValue: { available: true },
            remediation: 'Souscrire a Azure AD Premium P1 pour beneficier des politiques d\'acces conditionnel.',
          });
          return { category: this.category, findings, apiCallsCount: apiCalls.count };
        }
        throw err;
      }

      const enabledPolicies = policies.filter((p) => p.state === 'enabled');
      const reportOnlyPolicies = policies.filter((p) => p.state === 'enabledForReportingButNotEnforced');

      if (enabledPolicies.length === 0) {
        findings.push({
          checkId: 'NO_CONDITIONAL_ACCESS',
          category: FindingCategory.CONDITIONAL_ACCESS,
          severity: FindingSeverity.HIGH,
          title: 'Aucune politique d\'acces conditionnel active',
          description: 'Aucune politique d\'acces conditionnel n\'est activee. Ces politiques sont essentielles pour controler l\'acces aux ressources.',
          currentValue: { activePolicies: 0, totalPolicies: policies.length },
          expectedValue: { minActivePolicies: 1 },
          remediation: 'Creer et activer des politiques d\'acces conditionnel pour exiger le MFA, bloquer les connexions a risque et restreindre les appareils non conformes.',
        });
      }

      // Check for MFA policy
      const mfaPolicy = enabledPolicies.find((p) => {
        const controls = p.grantControls?.builtInControls || [];
        return controls.includes('mfa');
      });

      if (!mfaPolicy && enabledPolicies.length > 0) {
        findings.push({
          checkId: 'NO_MFA_CONDITIONAL_ACCESS',
          category: FindingCategory.CONDITIONAL_ACCESS,
          severity: FindingSeverity.MEDIUM,
          title: 'Pas de politique MFA via acces conditionnel',
          description: 'Aucune politique d\'acces conditionnel n\'exige le MFA. L\'utilisation de l\'acces conditionnel est le moyen recommande par Microsoft pour deployer le MFA.',
          currentValue: { mfaPolicy: false },
          expectedValue: { mfaPolicy: true },
          remediation: 'Creer une politique d\'acces conditionnel exigeant le MFA pour tous les utilisateurs et toutes les applications cloud.',
        });
      }

      // Check for location-based policies
      const locationPolicy = enabledPolicies.find((p) => {
        return p.conditions?.locations?.includeLocations?.length > 0 ||
               p.conditions?.locations?.excludeLocations?.length > 0;
      });

      if (!locationPolicy && enabledPolicies.length > 0) {
        findings.push({
          checkId: 'NO_LOCATION_POLICY',
          category: FindingCategory.CONDITIONAL_ACCESS,
          severity: FindingSeverity.LOW,
          title: 'Pas de restriction geographique',
          description: 'Aucune politique d\'acces conditionnel ne restreint les connexions par localisation. Les connexions depuis n\'importe quel pays sont autorisees.',
          currentValue: { locationPolicy: false },
          remediation: 'Considerer l\'ajout de restrictions geographiques pour bloquer les connexions depuis des pays non attendus.',
        });
      }

      if (reportOnlyPolicies.length > 0) {
        findings.push({
          checkId: 'REPORT_ONLY_POLICIES',
          category: FindingCategory.CONDITIONAL_ACCESS,
          severity: FindingSeverity.INFO,
          title: `${reportOnlyPolicies.length} politique(s) en mode rapport uniquement`,
          description: `${reportOnlyPolicies.length} politique(s) sont en mode "rapport uniquement" et ne bloquent pas les acces non conformes.`,
          currentValue: { reportOnlyCount: reportOnlyPolicies.length },
          remediation: 'Evaluer les politiques en mode rapport et les passer en mode "active" si elles sont validees.',
        });
      }
    } catch (err) {
      this.logger.error('Conditional access collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
