import { Injectable, Logger } from '@nestjs/common';
import { ICollector, CollectorResult, CollectorFinding } from '../interfaces/collector.interface';
import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';
import { graphGetAll, graphGet } from './graph-helper';

@Injectable()
export class SharingCollector implements ICollector {
  private readonly logger = new Logger(SharingCollector.name);
  readonly category = FindingCategory.SHARING;
  readonly name = 'Sharing Collector';

  async collect(accessToken: string): Promise<CollectorResult> {
    const findings: CollectorFinding[] = [];
    const apiCalls = { count: 0 };

    try {
      // Get SharePoint sites
      const sites = await graphGetAll<any>(
        accessToken,
        '/sites?search=*&$select=id,displayName,webUrl',
        apiCalls,
      );

      let anonymousShareCount = 0;
      let externalShareCount = 0;

      for (const site of sites.slice(0, 20)) {
        try {
          // Check site permissions
          const permissions = await graphGetAll<any>(
            accessToken,
            `/sites/${site.id}/permissions`,
            apiCalls,
          );

          for (const perm of permissions) {
            if (perm.link?.scope === 'anonymous') {
              anonymousShareCount++;
              findings.push({
                checkId: 'ANONYMOUS_SHARE',
                category: FindingCategory.SHARING,
                severity: FindingSeverity.HIGH,
                title: `Partage anonyme: ${site.displayName}`,
                description: `Le site SharePoint "${site.displayName}" a un lien de partage anonyme. N'importe qui avec le lien peut acceder au contenu.`,
                resource: site.webUrl,
                resourceType: 'SharePointSite',
                currentValue: { scope: 'anonymous', siteId: site.id },
                expectedValue: { scope: 'organization' },
                remediation: 'Remplacer les liens anonymes par des liens restreints a l\'organisation ou a des utilisateurs specifiques.',
              });
            }

            if (perm.grantedToIdentitiesV2?.some((id: any) => id.user?.email && !id.user.email.endsWith(site.webUrl?.split('.')[0]))) {
              externalShareCount++;
            }
          }

          // Check default sharing link type via drive
          try {
            const drive = await graphGet<any>(accessToken, `/sites/${site.id}/drive`, apiCalls);
            if (drive?.sharePointIds) {
              // Check recently shared items
              const sharedItems = await graphGetAll<any>(
                accessToken,
                `/sites/${site.id}/drive/sharedWithMe`,
                apiCalls,
              );
              // Just count, detailed analysis per item would be too API-heavy
            }
          } catch {
            // Drive access might be restricted for some sites
          }
        } catch (err) {
          this.logger.warn(`Could not check sharing for site ${site.displayName}: ${err.message}`);
        }
      }

      // Summary finding
      if (anonymousShareCount > 0) {
        findings.push({
          checkId: 'ANONYMOUS_SHARES_SUMMARY',
          category: FindingCategory.SHARING,
          severity: FindingSeverity.HIGH,
          title: `${anonymousShareCount} partage(s) anonyme(s) detecte(s)`,
          description: `${anonymousShareCount} lien(s) de partage anonyme(s) ont ete detecte(s) sur les sites SharePoint. Ces liens permettent un acces sans authentification.`,
          currentValue: { anonymousShares: anonymousShareCount },
          expectedValue: { anonymousShares: 0 },
          remediation: 'Desactiver le partage anonyme dans les parametres SharePoint admin et remplacer les liens existants.',
        });
      }
    } catch (err) {
      this.logger.error('Sharing collection failed', err);
      return { category: this.category, findings, apiCallsCount: apiCalls.count, error: err.message };
    }

    return { category: this.category, findings, apiCallsCount: apiCalls.count };
  }
}
