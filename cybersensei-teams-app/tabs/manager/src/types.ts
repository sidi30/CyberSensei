export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
  jobTitle?: string;
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  userPrincipalName: string;
}

export interface ManagerMetrics {
  companyScore: number;
  averageScore: number;
  totalUsers: number;
  activeUsers: number;
  completedExercises: number;
  departments: DepartmentMetrics[];
  topics: TopicMetrics[];
  licenseInfo?: {
    expiresAt: string;
    isActive: boolean;
    usersLimit: number;
  };
}

export interface DepartmentMetrics {
  name: string;
  averageScore: number;
  userCount: number;
}

export interface TopicMetrics {
  name: string;
  averageScore: number;
  completionRate: number;
}

export interface ManagerUser {
  id: string;
  displayName: string;
  email: string;
  department?: string;
  score: number;
  completedExercises: number;
  lastActivity?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  topicScores?: { topic: string; score: number }[];
  lastPhishingResult?: {
    date: string;
    success: boolean;
    testName: string;
  };
  recommendedActions?: string;
}

export interface Settings {
  phishingFrequency: number;
  trainingIntensity: 'low' | 'medium' | 'high';
}

