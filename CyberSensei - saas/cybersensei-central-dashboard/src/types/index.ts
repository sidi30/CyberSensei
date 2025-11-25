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
// TENANT
// ============================================

export interface Tenant {
  id: string;
  name: string;
  contactEmail: string;
  licenseKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantData {
  name: string;
  contactEmail: string;
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

