// User types
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  msTeamsId?: string;
  photoUrl?: string;
  active: boolean;
  createdAt: string;
}

// Exercise types
export enum ExerciseType {
  QUIZ = 'QUIZ',
  SIMULATION = 'SIMULATION',
  SCENARIO = 'SCENARIO',
  CHALLENGE = 'CHALLENGE',
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Exercise {
  id: number;
  topic: string;
  type: ExerciseType;
  difficulty: Difficulty;
  payloadJSON: QuizQuestion;
  active: boolean;
}

// Result types
export interface UserExerciseResult {
  id: number;
  userId: number;
  exerciseId: number;
  score: number;
  success: boolean;
  duration: number;
  detailsJSON?: any;
  date: string;
}

export interface SubmitExerciseRequest {
  score: number;
  success: boolean;
  duration: number;
  detailsJSON?: any;
}

// AI Chat types
export interface AIChatRequest {
  prompt: string;
  context?: string;
}

export interface AIChatResponse {
  response: string;
  sessionId: string;
}

// Metrics types
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface CompanyMetrics {
  id: number;
  score: number;
  riskLevel: RiskLevel;
  updatedAt: string;
  averageQuizScore: number;
  phishingClickRate: number;
  activeUsers: number;
  completedExercises: number;
}

export interface UserMetrics {
  userId: number;
  name: string;
  department?: string;
  score: number;
  riskLevel: RiskLevel;
  lastQuizDate?: string;
  completedExercises: number;
  phishingClickRate: number;
  topicBreakdown?: TopicScore[];
  recommendedActions?: string[];
}

export interface TopicScore {
  topic: string;
  score: number;
  exercises: number;
}

// Settings types
export interface CompanySettings {
  phishingFrequency: number; // per week
  trainingIntensity: 'low' | 'medium' | 'high';
  companyName?: string;
  smtpEnabled?: boolean;
}

// Auth types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}


