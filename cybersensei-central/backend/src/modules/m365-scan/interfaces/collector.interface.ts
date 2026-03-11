import { FindingCategory, FindingSeverity } from '../../../entities/m365-finding.entity';

export interface CollectorFinding {
  checkId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  resource?: string;
  resourceType?: string;
  currentValue?: Record<string, any>;
  expectedValue?: Record<string, any>;
  remediation?: string;
  metadata?: Record<string, any>;
}

export interface CollectorResult {
  category: FindingCategory;
  findings: CollectorFinding[];
  apiCallsCount: number;
  error?: string;
}

export interface ICollector {
  readonly category: FindingCategory;
  readonly name: string;
  collect(accessToken: string, tenantDomain: string): Promise<CollectorResult>;
}
