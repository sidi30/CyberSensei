import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll, graphGet } from './graph-helper';

@Injectable()
export class MfaCollector implements ICollector {
  private readonly logger = new Logger(MfaCollector.name);
  readonly category = FindingCategory.MFA;
  readonly name = 'MFA Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Get all enabled users
      const users = await graphGetAll<any>(
        accessToken,
        '/users?$filter=accountEnabled eq true&$select=id,displayName,userPrincipalName,userType',
        apiCalls,
      );

      // Get directory roles to identify admins
      const adminRoles = await graphGetAll<any>(accessToken, '/directoryRoles', apiCalls);
      const adminUserIds = new Set<string>();

      for (const role of adminRoles) {
        const members = await graphGetAll<any>(
          accessToken,
          `/directoryRoles/${role.id}/members?$select=id`,
          apiCalls,
        );
        members.forEach((m) => adminUserIds.add(m.id));
      }

      // Check MFA for each user (batch by checking authentication methods)
      for (const user of users) {
        try {
          const authMethods = await graphGet<any>(
            accessToken,
            `/users/${user.id}/authentication/methods`,
            apiCalls,
          );

          const methods = authMethods.value || [];
          const hasMfa = methods.some(
            (m: any) =>
              m['@odata.type'] === '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod' ||
              m['@odata.type'] === '#microsoft.graph.phoneAuthenticationMethod' ||
              m['@odata.type'] === '#microsoft.graph.fido2AuthenticationMethod' ||
              m['@odata.type'] === '#microsoft.graph.softwareOathAuthenticationMethod' ||
              m['@odata.type'] === '#microsoft.graph.windowsHelloForBusinessAuthenticationMethod',
          );

          if (!hasMfa) {
            const isAdmin = adminUserIds.has(user.id);
            findings.push({
              checkId: isAdmin ? 'MFA_ADMIN_NOT_ENABLED' : 'MFA_NOT_ENABLED',
              category: FindingCategory.MFA,
              severity: isAdmin ? FindingSeverity.CRITICAL : FindingSeverity.HIGH,
              title: isAdmin
                ? `Admin sans MFA: ${user.displayName}`
                : `Utilisateur sans MFA: ${user.displayName}`,
              description: isAdmin
                ? `Le compte administrateur ${user.userPrincipalName} n'a pas d'authentification multi-facteur activee. Un compte admin sans MFA est une cible privilegiee pour les attaquants.`
                : `Le compte ${user.userPrincipalName} n'a pas d'authentification multi-facteur activee.`,
              resource: user.userPrincipalName,
              resourceType: 'User',
              currentValue: { mfaEnabled: false, isAdmin },
              expectedValue: { mfaEnabled: true },
              remediation: `Activer le MFA pour ${user.userPrincipalName} via le portail Azure AD > Securite > MFA.`,
            });
          }
        } catch (err) {
          this.logger.warn(`Could not check MFA for user ${user.userPrincipalName}: ${err.message}`);
        }
      }

      // Summary finding if many users without MFA
      const usersWithoutMfa = findings.length;
      const mfaPercentage = users.length > 0 ? ((users.length - usersWithoutMfa) / users.length) * 100 : 100;

      if (mfaPercentage < 100) {
        findings.push({
          checkId: 'MFA_COVERAGE',
          category: FindingCategory.MFA,
          severity: mfaPercentage < 50 ? FindingSeverity.CRITICAL : mfaPercentage < 80 ? FindingSeverity.HIGH : FindingSeverity.MEDIUM,
          title: `Couverture MFA: ${mfaPercentage.toFixed(0)}%`,
          description: `${usersWithoutMfa} utilisateur(s) sur ${users.length} n'ont pas le MFA active.`,
          currentValue: { mfaCoverage: mfaPercentage, usersWithoutMfa, totalUsers: users.length },
          expectedValue: { mfaCoverage: 100 },
          remediation: 'Deployer le MFA pour tous les utilisateurs via une politique d\'acces conditionnel Azure AD.',
        });
      }
    } catch (err) {
      this.logger.error('MFA collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
