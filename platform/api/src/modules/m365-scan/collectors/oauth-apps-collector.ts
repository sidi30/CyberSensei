import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

@Injectable()
export class OAuthAppsCollector implements ICollector {
  private readonly logger = new Logger(OAuthAppsCollector.name);
  readonly category = FindingCategory.OAUTH_APPS;
  readonly name = 'OAuth Apps Collector';

  private readonly highRiskPermissions = [
    'Mail.ReadWrite',
    'Mail.Send',
    'Files.ReadWrite.All',
    'Directory.ReadWrite.All',
    'User.ReadWrite.All',
    'Application.ReadWrite.All',
    'RoleManagement.ReadWrite.Directory',
  ];

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Get service principals (third-party apps)
      const servicePrincipals = await graphGetAll<any>(
        accessToken,
        '/servicePrincipals?$filter=tags/any(t:t eq \'WindowsAzureActiveDirectoryIntegratedApp\')&$select=id,displayName,appId,publisherName,verifiedPublisher,appOwnerOrganizationId,createdDateTime',
        apiCalls,
      );

      // Get OAuth permission grants
      const oauthGrants = await graphGetAll<any>(
        accessToken,
        '/oauth2PermissionGrants?$select=id,clientId,consentType,principalId,scope,resourceId',
        apiCalls,
      );

      // Map grants by client app
      const grantsByApp = new Map<string, any[]>();
      for (const grant of oauthGrants) {
        if (!grantsByApp.has(grant.clientId)) {
          grantsByApp.set(grant.clientId, []);
        }
        grantsByApp.get(grant.clientId).push(grant);
      }

      for (const sp of servicePrincipals) {
        const grants = grantsByApp.get(sp.id) || [];
        const allScopes = grants.flatMap((g) => (g.scope || '').split(' ').filter(Boolean));

        const riskyScopes = allScopes.filter((s) =>
          this.highRiskPermissions.some((hrp) => s.includes(hrp)),
        );

        if (riskyScopes.length > 0) {
          const isUnverified = !sp.verifiedPublisher?.displayName;
          findings.push({
            checkId: 'OAUTH_APP_HIGH_RISK',
            category: FindingCategory.OAUTH_APPS,
            severity: isUnverified ? FindingSeverity.HIGH : FindingSeverity.MEDIUM,
            title: `App OAuth a risque: ${sp.displayName}`,
            description: `L'application "${sp.displayName}" (editeur: ${sp.publisherName || 'inconnu'}) a des permissions sensibles: ${riskyScopes.join(', ')}.${isUnverified ? ' L\'editeur n\'est pas verifie par Microsoft.' : ''}`,
            resource: sp.displayName,
            resourceType: 'ServicePrincipal',
            currentValue: {
              appId: sp.appId,
              publisher: sp.publisherName,
              verifiedPublisher: sp.verifiedPublisher?.displayName || null,
              riskyScopes,
              allScopes,
            },
            remediation: `Revoir les permissions de "${sp.displayName}". Si l'app n'est pas necessaire, la revoquer dans Azure AD > Applications d'entreprise.`,
          });
        }

        // Check for admin consent (consentType = 'AllPrincipals')
        const adminConsentGrants = grants.filter((g) => g.consentType === 'AllPrincipals');
        if (adminConsentGrants.length > 0 && !sp.verifiedPublisher?.displayName) {
          findings.push({
            checkId: 'OAUTH_APP_ADMIN_CONSENT_UNVERIFIED',
            category: FindingCategory.OAUTH_APPS,
            severity: FindingSeverity.MEDIUM,
            title: `Consentement admin pour app non verifiee: ${sp.displayName}`,
            description: `L'application "${sp.displayName}" a un consentement administrateur pour tous les utilisateurs, mais son editeur n'est pas verifie.`,
            resource: sp.displayName,
            resourceType: 'ServicePrincipal',
            currentValue: { adminConsent: true, verified: false },
            remediation: 'Revoir le consentement administrateur et le revoquer si l\'application n\'est pas essentielle.',
          });
        }
      }

      // Summary
      if (servicePrincipals.length > 50) {
        findings.push({
          checkId: 'OAUTH_APPS_EXCESSIVE',
          category: FindingCategory.OAUTH_APPS,
          severity: FindingSeverity.LOW,
          title: `Nombre eleve d'applications OAuth (${servicePrincipals.length})`,
          description: `${servicePrincipals.length} applications tierces ont acces au tenant. Un nombre eleve augmente la surface d'attaque.`,
          currentValue: { appCount: servicePrincipals.length },
          remediation: 'Faire un audit regulier des applications OAuth et revoquer celles qui ne sont plus utilisees.',
        });
      }
    } catch (err) {
      this.logger.error('OAuth apps collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
