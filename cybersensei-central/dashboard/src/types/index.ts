// ============================================
// USER & AUTHENTICATION
// ============================================

export enum AdminRole {
  SUPERADMIN = 'SUPERADMIN',
  SUPPORT = 'SUPPORT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'active' | 'createdAt' | 'lastLoginAt'>;
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

// ============================================
// SECTOR & AI CONFIG
// ============================================

export enum TenantSector {
  BANKING = 'BANKING',
  HEALTHCARE = 'HEALTHCARE',
  INDUSTRY = 'INDUSTRY',
  RETAIL = 'RETAIL',
  TECH = 'TECH',
  EDUCATION = 'EDUCATION',
  GOVERNMENT = 'GOVERNMENT',
  ENERGY = 'ENERGY',
  TELECOM = 'TELECOM',
  LEGAL = 'LEGAL',
}

export const SECTOR_LABELS: Record<TenantSector, string> = {
  [TenantSector.BANKING]: 'Banque & Finance',
  [TenantSector.HEALTHCARE]: 'Santé',
  [TenantSector.INDUSTRY]: 'Industrie',
  [TenantSector.RETAIL]: 'Commerce & Distribution',
  [TenantSector.TECH]: 'Technologie',
  [TenantSector.EDUCATION]: 'Éducation',
  [TenantSector.GOVERNMENT]: 'Secteur Public',
  [TenantSector.ENERGY]: 'Énergie',
  [TenantSector.TELECOM]: 'Télécommunications',
  [TenantSector.LEGAL]: 'Juridique',
};

export enum AiProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
}

export enum GenerationFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ON_DEMAND = 'ON_DEMAND',
}

export interface AiConfig {
  id: string;
  tenantId: string;
  provider: AiProvider;
  maskedApiKey: string;
  enabled: boolean;
  generationFrequency: GenerationFrequency;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  topic: string;
  type: string;
  difficulty: string;
  payloadJSON: Record<string, any>;
  version: string;
  active: boolean;
  generatedByAi: boolean;
  tenantId?: string;
  description?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseStats {
  total: number;
  active: number;
  byTopic: Record<string, number>;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
}

// ============================================
// TENANT
// ============================================

export interface Tenant {
  id: string;
  name: string;
  contactEmail: string;
  licenseKey: string;
  active: boolean;
  sector?: TenantSector;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantData {
  name: string;
  contactEmail: string;
  companyName?: string;
  sector?: TenantSector;
}

// ============================================
// LICENSE
// ============================================

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export interface License {
  id: string;
  key: string;
  tenantId: string;
  expiresAt: string;
  status: LicenseStatus;
  maxNodes: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// METRICS
// ============================================

export interface TenantMetric {
  id: string;
  tenantId: string;
  uptime: number;
  activeUsers: number;
  exercisesCompletedToday: number;
  aiLatency: number | null;
  version: string | null;
  timestamp: string;
  additionalData?: Record<string, any>;
}

export interface AggregatedMetrics {
  period: '24h' | '7d' | '30d';
  startDate: string;
  endDate: string;
  dataPoints: number;
  metrics: {
    avgUptime: number;
    avgActiveUsers: number;
    avgExercisesPerDay: number;
    avgAiLatency: number | null;
    maxActiveUsers: number;
    maxExercises: number;
    maxAiLatency: number | null;
    minActiveUsers: number;
    minExercises: number;
    minAiLatency: number | null;
    totalExercises: number;
  };
  trend?: {
    activeUsers: 'increasing' | 'decreasing' | 'stable';
    exercises: 'increasing' | 'decreasing' | 'stable';
    aiLatency: 'increasing' | 'decreasing' | 'stable' | 'n/a';
  };
}

export interface GlobalSummary {
  timestamp: string;
  tenants: {
    total: number;
    active: number;
    inactive: number;
    withRecentData: number;
  };
  licenses: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
  };
  usage: {
    totalActiveUsers: number;
    totalExercisesCompletedToday: number;
    averageAiLatency: number | null;
    totalUptime: number;
  };
  health: {
    healthy: number;
    warning: number;
    critical: number;
    noData: number;
  };
  versions: {
    version: string;
    count: number;
  }[];
}

export interface UsageTrend {
  date: string;
  avgActiveUsers: number;
  totalExercises: number;
  avgAiLatency: number | null;
  tenantsReporting: number;
  uptimePercentage: number;
}

export interface UsageTrends {
  period: string;
  startDate: string;
  endDate: string;
  dataPoints: number;
  trends: UsageTrend[];
  summary: {
    avgDailyUsers: number;
    avgDailyExercises: number;
    avgAiLatency: number | null;
    peakUsers: number;
    peakDate: string;
  };
}

// ============================================
// UPDATE
// ============================================

export interface UpdateMetadata {
  id: string;
  version: string;
  changelog: string;
  requiredNodeVersion: string;
  createdAt: string;
}

export interface UpdateCheckResponse {
  available: boolean;
  updateId?: string;
  version?: string;
  changelog?: string;
}

// ============================================
// SUBSCRIPTION & PLANS
// ============================================

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export const PLAN_LABELS: Record<PlanType, string> = {
  [PlanType.FREE]: 'Gratuit',
  [PlanType.STARTER]: 'Starter',
  [PlanType.BUSINESS]: 'Business',
  [PlanType.ENTERPRISE]: 'Enterprise',
};

export const PLAN_PRICES: Record<PlanType, string> = {
  [PlanType.FREE]: '0 EUR',
  [PlanType.STARTER]: '79 EUR/mois',
  [PlanType.BUSINESS]: '199 EUR/mois',
  [PlanType.ENTERPRISE]: 'Sur devis',
};

export const PLAN_COLORS: Record<PlanType, string> = {
  [PlanType.FREE]: 'gray',
  [PlanType.STARTER]: 'blue',
  [PlanType.BUSINESS]: 'purple',
  [PlanType.ENTERPRISE]: 'amber',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Actif',
  [SubscriptionStatus.TRIAL]: 'Essai',
  [SubscriptionStatus.PAST_DUE]: 'Impayé',
  [SubscriptionStatus.CANCELLED]: 'Annulé',
  [SubscriptionStatus.EXPIRED]: 'Expiré',
};

export interface Subscription {
  id: string;
  tenantId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  monthlyPrice: number;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  currentMonthExercises: number;
  currentMonthPhishing: number;
  activeUsers: number;
  usageResetAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}

export interface SubscriptionStats {
  total: number;
  byPlan: Record<PlanType, number>;
  byStatus: Record<SubscriptionStatus, number>;
  mrr: number;
}

// ============================================
// API RESPONSE
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

