import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll, graphGet } from './graph-helper';

@Injectable()
export class EmailForwardingCollector implements ICollector {
  private readonly logger = new Logger(EmailForwardingCollector.name);
  readonly category = FindingCategory.EMAIL_FORWARDING;
  readonly name = 'Email Forwarding Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      const users = await graphGetAll<any>(
        accessToken,
        '/users?$filter=accountEnabled eq true&$select=id,displayName,userPrincipalName,mail',
        apiCalls,
      );

      for (const user of users) {
        try {
          // Check mailbox settings for auto-forwarding
          const mailboxSettings = await graphGet<any>(
            accessToken,
            `/users/${user.id}/mailboxSettings`,
            apiCalls,
          );

          if (mailboxSettings.automaticRepliesSetting?.externalAudience === 'all') {
            findings.push({
              checkId: 'AUTO_REPLY_EXTERNAL',
              category: FindingCategory.EMAIL_FORWARDING,
              severity: FindingSeverity.LOW,
              title: `Reponses automatiques externes: ${user.displayName}`,
              description: `${user.userPrincipalName} a des reponses automatiques configurees pour les expediteurs externes.`,
              resource: user.userPrincipalName,
              resourceType: 'Mailbox',
              currentValue: { externalAudience: 'all' },
              remediation: 'Verifier que les reponses automatiques externes ne divulguent pas d\'informations sensibles.',
            });
          }

          // Check inbox rules for forwarding
          const rules = await graphGetAll<any>(
            accessToken,
            `/users/${user.id}/mailFolders/inbox/messageRules`,
            apiCalls,
          );

          for (const rule of rules) {
            if (rule.isEnabled && rule.actions) {
              const forwardTo = rule.actions.forwardTo || [];
              const redirectTo = rule.actions.redirectTo || [];
              const allTargets = [...forwardTo, ...redirectTo];

              for (const target of allTargets) {
                const targetEmail = target.emailAddress?.address || 'unknown';
                const userDomain = user.userPrincipalName?.split('@')[1];
                const targetDomain = targetEmail.split('@')[1];
                const isExternal = targetDomain && userDomain && targetDomain !== userDomain;

                if (isExternal) {
                  findings.push({
                    checkId: 'EXTERNAL_FORWARDING_RULE',
                    category: FindingCategory.EMAIL_FORWARDING,
                    severity: FindingSeverity.CRITICAL,
                    title: `Transfert externe: ${user.displayName} → ${targetEmail}`,
                    description: `La regle "${rule.displayName}" transfere les emails de ${user.userPrincipalName} vers l'adresse externe ${targetEmail}. Ceci peut etre le signe d'un compte compromis.`,
                    resource: user.userPrincipalName,
                    resourceType: 'InboxRule',
                    currentValue: {
                      ruleName: rule.displayName,
                      targetEmail,
                      isExternal: true,
                      ruleEnabled: rule.isEnabled,
                    },
                    expectedValue: { externalForwarding: false },
                    remediation: `Verifier avec ${user.displayName} si cette regle est legitime. Si non, la supprimer et investiguer un eventuel compromis du compte.`,
                  });
                }
              }
            }
          }
        } catch (err) {
          this.logger.warn(`Could not check forwarding for ${user.userPrincipalName}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error('Email forwarding collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
