/**
 * Métriques agrégées pour une période donnée
 */
export interface AggregatedMetrics {
  period: '24h' | '7d' | '30d';
  startDate: Date;
  endDate: Date;
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

/**
 * Résumé global de la plateforme
 */
export interface GlobalSummary {
  timestamp: Date;
  
  tenants: {
    total: number;
    active: number;
    inactive: number;
    withRecentData: number; // Métriques < 1h
  };
  
  licenses: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number; // < 30 jours
  };
  
  usage: {
    totalActiveUsers: number;
    totalExercisesCompletedToday: number;
    averageAiLatency: number | null;
    totalUptime: number; // Somme des uptimes
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

/**
 * Tendances d'utilisation
 */
export interface UsageTrend {
  date: string; // YYYY-MM-DD
  avgActiveUsers: number;
  totalExercises: number;
  avgAiLatency: number | null;
  tenantsReporting: number;
  uptimePercentage: number;
}

export interface UsageTrends {
  period: string;
  startDate: Date;
  endDate: Date;
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

