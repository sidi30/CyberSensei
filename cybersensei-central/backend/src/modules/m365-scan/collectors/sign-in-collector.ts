import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll } from './graph-helper';

@Injectable()
export class SignInCollector implements ICollector {
  private readonly logger = new Logger(SignInCollector.name);
  readonly category = FindingCategory.SIGN_IN;
  readonly name = 'Sign-In Collector';

  async collect(accessToken: string, _tenantDomain: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Get recent sign-in logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateFilter = sevenDaysAgo.toISOString();

      let signIns: any[] = [];
      try {
        signIns = await graphGetAll<any>(
          accessToken,
          `/auditLogs/signIns?$filter=createdDateTime ge ${dateFilter}&$top=500&$select=id,userPrincipalName,ipAddress,location,riskState,riskLevelDuringSignIn,riskLevelAggregated,status,conditionalAccessStatus,createdDateTime,appDisplayName,clientAppUsed`,
          apiCalls,
        );
      } catch (err) {
        // Sign-in logs require Azure AD P1
        if (err.message?.includes('404') || err.message?.includes('403')) {
          findings.push({
            checkId: 'SIGN_IN_LOGS_NOT_AVAILABLE',
            category: FindingCategory.SIGN_IN,
            severity: FindingSeverity.MEDIUM,
            title: 'Journaux de connexion non disponibles',
            description: 'Les journaux de connexion Azure AD ne sont pas disponibles. Cette fonctionnalite requiert Azure AD Premium P1.',
            currentValue: { available: false },
            remediation: 'Souscrire a Azure AD Premium P1 pour acceder aux journaux de connexion et detecter les acces suspects.',
          });
          return { category: this.category, findings, apiCallsCount: apiCalls.count };
        }
        throw err;
      }

      // Analyze risky sign-ins
      const riskySignIns = signIns.filter(
        (s) => s.riskLevelDuringSignIn === 'high' || s.riskLevelDuringSignIn === 'medium',
      );

      if (riskySignIns.length > 0) {
        const highRisk = riskySignIns.filter((s) => s.riskLevelDuringSignIn === 'high');
        findings.push({
          checkId: 'RISKY_SIGN_INS',
          category: FindingCategory.SIGN_IN,
          severity: highRisk.length > 0 ? FindingSeverity.HIGH : FindingSeverity.MEDIUM,
          title: `${riskySignIns.length} connexion(s) a risque detectee(s)`,
          description: `${riskySignIns.length} connexion(s) a risque ont ete detectee(s) dans les 7 derniers jours, dont ${highRisk.length} a risque eleve.`,
          currentValue: {
            totalRisky: riskySignIns.length,
            highRisk: highRisk.length,
            users: [...new Set(riskySignIns.map((s) => s.userPrincipalName))].slice(0, 10),
          },
          remediation: 'Investiguer les connexions a risque dans Azure AD > Securite > Connexions a risque. Activer des politiques d\'acces conditionnel pour bloquer les connexions a risque.',
        });
      }

      // Check for failed sign-ins (potential brute force)
      const failedSignIns = signIns.filter(
        (s) => s.status?.errorCode && s.status.errorCode !== 0,
      );

      // Group failures by user
      const failuresByUser = new Map<string, number>();
      for (const signIn of failedSignIns) {
        const user = signIn.userPrincipalName || 'unknown';
        failuresByUser.set(user, (failuresByUser.get(user) || 0) + 1);
      }

      const bruteForceTargets = [...failuresByUser.entries()].filter(
        ([, count]) => count >= 10,
      );

      if (bruteForceTargets.length > 0) {
        findings.push({
          checkId: 'BRUTE_FORCE_ATTEMPTS',
          category: FindingCategory.SIGN_IN,
          severity: FindingSeverity.HIGH,
          title: `${bruteForceTargets.length} compte(s) cible(s) par des tentatives repetees`,
          description: `${bruteForceTargets.length} compte(s) ont subi plus de 10 tentatives de connexion echouees en 7 jours, ce qui peut indiquer une attaque par force brute.`,
          currentValue: {
            targets: bruteForceTargets.map(([user, count]) => ({ user, failures: count })),
          },
          remediation: 'Activer le MFA et les politiques d\'acces conditionnel. Envisager Azure AD Identity Protection pour bloquer automatiquement les comptes a risque.',
        });
      }

      // Check for legacy authentication protocols
      const legacyProtocols = ['Exchange ActiveSync', 'IMAP4', 'POP3', 'Authenticated SMTP', 'Exchange Online PowerShell'];
      const legacySignIns = signIns.filter((s) =>
        legacyProtocols.some((p) => s.clientAppUsed?.includes(p)),
      );

      if (legacySignIns.length > 0) {
        const users = [...new Set(legacySignIns.map((s) => s.userPrincipalName))];
        findings.push({
          checkId: 'LEGACY_AUTHENTICATION',
          category: FindingCategory.SIGN_IN,
          severity: FindingSeverity.MEDIUM,
          title: `Authentification legacy detectee (${users.length} utilisateur(s))`,
          description: `${users.length} utilisateur(s) utilisent des protocoles d'authentification legacy (IMAP, POP3, ActiveSync). Ces protocoles ne supportent pas le MFA et sont des vecteurs d'attaque courants.`,
          currentValue: {
            usersCount: users.length,
            protocols: [...new Set(legacySignIns.map((s) => s.clientAppUsed))],
            users: users.slice(0, 10),
          },
          remediation: 'Bloquer l\'authentification legacy via une politique d\'acces conditionnel. Migrer les utilisateurs vers des clients modernes (Outlook Mobile, Outlook Desktop).',
        });
      }
    } catch (err) {
      this.logger.error('Sign-in collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
