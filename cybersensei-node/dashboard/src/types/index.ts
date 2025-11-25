// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  department: string;
  active: boolean;
  createdAt: string;
}

// Metrics Types
export interface CompanyMetrics {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  participationRate: number;
  totalUsers: number;
  activeUsers: number;
  exercisesCompletedToday: number;
  phishingSuccessRate: number;
  updatedAt: string;
}

export interface UserMetrics {
  userId: number;
  userName: string;
  department: string;
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  exercisesCompleted: number;
  phishingTestsPassed: number;
  phishingTestsFailed: number;
  weaknesses: string[];
  lastActivity: string;
}

// Exercise Types
export interface Exercise {
  id: number;
  topic: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SIMULATION';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  payloadJSON: Record<string, any>;
  createdAt: string;
}

// Phishing Types
export interface PhishingCampaign {
  id: number;
  templateId: number;
  sentAt: string;
  totalSent: number;
  totalClicked: number;
  totalOpened: number;
  totalReported: number;
}

export interface PhishingTemplate {
  id: number;
  label: string;
  subject: string;
  type: string;
  active: boolean;
  createdAt: string;
}

export interface PhishingResult {
  campaign: PhishingCampaign;
  template: PhishingTemplate;
  clickRate: number;
  openRate: number;
  reportRate: number;
}

// Settings Types
export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface FrequencyConfig {
  phishingFrequency: number; // per week
  trainingIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateStatus {
  enabled: boolean;
  lastUpdateCheck: string;
  lastTelemetryPush: string;
  currentVersion: string;
  updateAvailable: boolean;
  latestVersion?: string;
}

export interface LicenseInfo {
  type: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  tenantId: string;
  expiresAt: string;
  maxUsers: number;
  features: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendData {
  label: string;
  data: ChartDataPoint[];
  color: string;
}


