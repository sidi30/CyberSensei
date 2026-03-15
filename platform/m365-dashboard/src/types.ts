export interface M365Score {
  id: string;
  scanId: string;
  tenantId: string;
  globalScore: number;
  globalGrade: string;
  categoryScores: Record<string, CategoryScore>;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  previousScore: number | null;
  previousGrade: string | null;
  scoreDelta: number | null;
  calculatedAt: string;
}

export interface CategoryScore {
  score: number;
  grade: string;
  findings: number;
  weight: number;
}

export interface M365Scan {
  id: string;
  tenantId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  trigger: 'MANUAL' | 'SCHEDULED' | 'ON_CONNECT';
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  infoFindings: number;
  categories: string[];
  failedCategories: string[] | null;
  createdAt: string;
  findings?: M365Finding[];
}

export interface M365Finding {
  id: string;
  scanId: string;
  tenantId: string;
  checkId: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  resource: string | null;
  resourceType: string | null;
  currentValue: Record<string, unknown> | null;
  expectedValue: Record<string, unknown> | null;
  remediation: string | null;
  createdAt: string;
}

export interface M365Alert {
  id: string;
  tenantId: string;
  scanId: string | null;
  type: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'ACKNOWLEDGED';
  title: string;
  message: string;
  severity: string;
  recipientEmail: string | null;
  sentAt: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface ConnectionStatus {
  connected: boolean;
  microsoftTenantDomain?: string;
  connectedByEmail?: string;
  lastScanAt?: string;
  tokenValid?: boolean;
}
