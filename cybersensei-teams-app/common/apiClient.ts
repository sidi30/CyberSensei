/**
 * Client API pour communiquer avec le backend CyberSensei
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from './config';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
  jobTitle?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  topic: string;
  difficulty: string;
  dueDate?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
}

export interface ExerciseHistory {
  id: string;
  exerciseId: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: string;
  topic: string;
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
}

export interface SubmitAnswersRequest {
  answers: { questionId: string; answer: number }[];
}

export interface SubmitAnswersResponse {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  feedback: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  context?: string;
}

/**
 * Client API CyberSensei
 */
export class CyberSenseiApiClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(baseURL: string = config.backendBaseUrl, authToken?: string) {
    this.authToken = authToken;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  /**
   * Définit le token d'authentification
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Récupère les informations de l'utilisateur courant
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/user/me');
    return response.data;
  }

  /**
   * Récupère le quiz du jour
   */
  async getTodayQuiz(): Promise<Quiz> {
    const response = await this.client.get<Quiz>('/api/quiz/today');
    return response.data;
  }

  /**
   * Soumet les réponses à un exercice
   */
  async submitExercise(
    exerciseId: string,
    answers: SubmitAnswersRequest
  ): Promise<SubmitAnswersResponse> {
    const response = await this.client.post<SubmitAnswersResponse>(
      `/api/exercise/${exerciseId}/submit`,
      answers
    );
    return response.data;
  }

  /**
   * Récupère l'historique des exercices de l'utilisateur
   */
  async getHistory(): Promise<ExerciseHistory[]> {
    const response = await this.client.get<ExerciseHistory[]>('/api/exercises/history');
    return response.data;
  }

  /**
   * Récupère les métriques pour les managers
   */
  async getManagerMetrics(): Promise<ManagerMetrics> {
    const response = await this.client.get<ManagerMetrics>('/api/manager/metrics');
    return response.data;
  }

  /**
   * Récupère la liste des utilisateurs pour les managers
   */
  async getManagerUsers(filters?: {
    department?: string;
    topic?: string;
  }): Promise<ManagerUser[]> {
    const response = await this.client.get<ManagerUser[]>('/api/manager/users', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Envoie un message au chatbot IA
   */
  async chatWithAI(message: string, context?: string): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/ai/chat', {
      message,
      context,
    });
    return response.data;
  }
}

/**
 * Instance par défaut du client API
 */
export const apiClient = new CyberSenseiApiClient();

/**
 * Crée une instance du client avec un token spécifique
 */
export function createApiClient(authToken: string): CyberSenseiApiClient {
  return new CyberSenseiApiClient(config.backendBaseUrl, authToken);
}

