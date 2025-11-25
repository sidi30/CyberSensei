/**
 * Service pour les appels au backend CyberSensei
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

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

export interface SubmitAnswersRequest {
  answers: { questionId: string; answer: number }[];
}

export interface SubmitAnswersResponse {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  feedback: string;
  details?: {
    questionId: string;
    correct: boolean;
    userAnswer: number;
    correctAnswer: number;
  }[];
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  context?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  department?: string;
  jobTitle?: string;
}

export interface ManagerMetrics {
  companyScore: number;
  averageScore: number;
  totalUsers: number;
  activeUsers: number;
  completedExercises: number;
}

/**
 * Service pour communiquer avec le backend CyberSensei
 */
export class BackendService {
  private client: AxiosInstance;

  constructor(baseURL: string = config.backendBaseUrl) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour logger les requêtes
    this.client.interceptors.request.use((config) => {
      console.log(`[Backend] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Intercepteur pour logger les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[Backend] Error:', error.message);
        if (error.response) {
          console.error('[Backend] Status:', error.response.status);
          console.error('[Backend] Data:', error.response.data);
        }
        throw error;
      }
    );
  }

  /**
   * Récupère le quiz du jour
   */
  async getTodayQuiz(userId?: string): Promise<Quiz> {
    const response = await this.client.get<Quiz>('/api/quiz/today', {
      params: { userId },
    });
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
   * Communique avec le chatbot IA
   */
  async chatWithAI(message: string, context?: string): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/ai/chat', {
      message,
      context,
    });
    return response.data;
  }

  /**
   * Récupère les informations utilisateur
   */
  async getUser(userId: string): Promise<User> {
    const response = await this.client.get<User>('/api/user/me', {
      params: { userId },
    });
    return response.data;
  }

  /**
   * Récupère les métriques pour les managers
   */
  async getManagerMetrics(): Promise<ManagerMetrics> {
    const response = await this.client.get<ManagerMetrics>('/api/manager/metrics');
    return response.data;
  }
}

// Instance singleton
export const backendService = new BackendService();

