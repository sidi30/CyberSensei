import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

@Injectable()
export class MailboxCollector implements ICollector {
  private readonly logger = new Logger(MailboxCollector.name);
  readonly category = FindingCategory.MAILBOX;
  readonly name = 'Mailbox Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Check for disabled accounts that still have active mailboxes
      const disabledUsers = await graphGetAll<any>(
        accessToken,
        '/users?$filter=accountEnabled eq false&$select=id,displayName,userPrincipalName,accountEnabled,assignedLicenses',
        apiCalls,
      );

      const disabledWithLicense = disabledUsers.filter(
        (u) => u.assignedLicenses?.length > 0,
      );

      if (disabledWithLicense.length > 0) {
        findings.push({
          checkId: 'DISABLED_ACCOUNTS_WITH_LICENSE',
          category: FindingCategory.MAILBOX,
          severity: FindingSeverity.LOW,
          title: `${disabledWithLicense.length} compte(s) desactive(s) avec licence(s)`,
          description: `${disabledWithLicense.length} compte(s) desactive(s) ont encore des licences assignees. Cela represente un cout inutile et potentiellement un risque si les boites mail restent accessibles.`,
          currentValue: {
            count: disabledWithLicense.length,
            users: disabledWithLicense.slice(0, 10).map((u) => u.userPrincipalName),
          },
          expectedValue: { disabledWithLicense: 0 },
          remediation: 'Retirer les licences des comptes desactives et convertir les boites mail en boites partagees si necessaire.',
        });
      }

      // Get all enabled users to check for shared vs regular mailboxes
      const allUsers = await graphGetAll<any>(
        accessToken,
        '/users?$filter=accountEnabled eq true&$select=id,displayName,userPrincipalName,userType,createdDateTime,lastPasswordChangeDateTime',
        apiCalls,
      );

      // Check for guest users
      const guestUsers = allUsers.filter((u) => u.userType === 'Guest');
      if (guestUsers.length > 20) {
        findings.push({
          checkId: 'EXCESSIVE_GUEST_USERS',
          category: FindingCategory.MAILBOX,
          severity: FindingSeverity.LOW,
          title: `Nombre eleve d'utilisateurs invites (${guestUsers.length})`,
          description: `${guestUsers.length} utilisateurs invites (guest) sont presents dans le tenant. Un nombre eleve d'invites augmente la surface d'attaque et complique la gouvernance.`,
          currentValue: { guestCount: guestUsers.length },
          remediation: 'Revoir regulierement les utilisateurs invites et supprimer ceux qui ne sont plus necessaires. Configurer une expiration automatique des invitations.',
        });
      }

      // Check for users without recent password change (>365 days) — only if no MFA
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const stalePasswords = allUsers.filter((u) => {
        if (!u.lastPasswordChangeDateTime) return true;
        return new Date(u.lastPasswordChangeDateTime) < oneYearAgo;
      });

      if (stalePasswords.length > 0) {
        findings.push({
          checkId: 'STALE_PASSWORDS',
          category: FindingCategory.MAILBOX,
          severity: FindingSeverity.INFO,
          title: `${stalePasswords.length} mot(s) de passe ancien(s) (>1 an)`,
          description: `${stalePasswords.length} utilisateur(s) n'ont pas change leur mot de passe depuis plus d'un an. Ce point est informatif car l'expiration n'est plus recommandee si le MFA est actif.`,
          currentValue: { staleCount: stalePasswords.length, totalUsers: allUsers.length },
          remediation: 'S\'assurer que le MFA est active pour ces utilisateurs. Si non, envisager un changement de mot de passe.',
        });
      }
    } catch (err) {
      this.logger.error('Mailbox collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
