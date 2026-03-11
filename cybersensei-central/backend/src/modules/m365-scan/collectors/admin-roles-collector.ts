import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

@Injectable()
export class AdminRolesCollector implements ICollector {
  private readonly logger = new Logger(AdminRolesCollector.name);
  readonly category = FindingCategory.ADMIN_ROLES;
  readonly name = 'Admin Roles Collector';

  private readonly criticalRoles = [
    'Global Administrator',
    'Privileged Role Administrator',
    'Exchange Administrator',
    'SharePoint Administrator',
    'Security Administrator',
  ];

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      const directoryRoles = await graphGetAll<any>(accessToken, '/directoryRoles', apiCalls);

      let totalAdmins = 0;
      let globalAdminCount = 0;
      const adminDetails: { role: string; members: string[] }[] = [];

      for (const role of directoryRoles) {
        const members = await graphGetAll<any>(
          accessToken,
          `/directoryRoles/${role.id}/members?$select=id,displayName,userPrincipalName`,
          apiCalls,
        );

        if (members.length > 0) {
          totalAdmins += members.length;
          adminDetails.push({
            role: role.displayName,
            members: members.map((m) => m.userPrincipalName),
          });

          if (role.displayName === 'Global Administrator') {
            globalAdminCount = members.length;

            if (members.length > 4) {
              findings.push({
                checkId: 'TOO_MANY_GLOBAL_ADMINS',
                category: FindingCategory.ADMIN_ROLES,
                severity: FindingSeverity.HIGH,
                title: `Trop d'administrateurs globaux (${members.length})`,
                description: `Il y a ${members.length} administrateurs globaux. Microsoft recommande un maximum de 4. Chaque admin global a un acces complet au tenant.`,
                currentValue: { count: members.length, admins: members.map((m) => m.userPrincipalName) },
                expectedValue: { maxCount: 4 },
                remediation: 'Reduire le nombre d\'administrateurs globaux. Utiliser des roles specifiques (Exchange Admin, SharePoint Admin) au lieu du role Global Administrator.',
              });
            }

            if (members.length < 2) {
              findings.push({
                checkId: 'SINGLE_GLOBAL_ADMIN',
                category: FindingCategory.ADMIN_ROLES,
                severity: FindingSeverity.MEDIUM,
                title: 'Un seul administrateur global',
                description: 'Il n\'y a qu\'un seul administrateur global. En cas d\'indisponibilite de cette personne, personne ne peut administrer le tenant.',
                currentValue: { count: members.length },
                expectedValue: { minCount: 2 },
                remediation: 'Ajouter au moins un deuxieme administrateur global comme compte de secours (break-glass account).',
              });
            }
          }
        }
      }

      // Check for accounts with multiple admin roles
      const userRoles = new Map<string, string[]>();
      for (const detail of adminDetails) {
        for (const member of detail.members) {
          if (!userRoles.has(member)) {
            userRoles.set(member, []);
          }
          userRoles.get(member).push(detail.role);
        }
      }

      for (const [user, roles] of userRoles) {
        if (roles.length > 3) {
          findings.push({
            checkId: 'USER_EXCESSIVE_ROLES',
            category: FindingCategory.ADMIN_ROLES,
            severity: FindingSeverity.MEDIUM,
            title: `Roles multiples: ${user}`,
            description: `L'utilisateur ${user} a ${roles.length} roles administratifs: ${roles.join(', ')}. Le principe du moindre privilege recommande de limiter les roles.`,
            resource: user,
            resourceType: 'User',
            currentValue: { roles, count: roles.length },
            expectedValue: { maxRoles: 3 },
            remediation: 'Revoir les roles attribues et ne conserver que ceux strictement necessaires.',
          });
        }
      }
    } catch (err) {
      this.logger.error('Admin roles collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
