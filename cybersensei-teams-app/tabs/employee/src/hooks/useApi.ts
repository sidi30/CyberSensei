import { useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import type {
  User,
  Quiz,
  ExerciseHistory,
  SubmitAnswersResponse,
} from '../types';

export interface AIProfile {
  id: number;
  userId: number;
  style: string;
  streakDays: number;
  totalXP: number;
  currentLevel: number;
  preferences: {
    preferredDifficulty?: string;
    uiTheme?: string;
    notificationsEnabled?: boolean;
    dailyGoal?: number;
    preferredTopics?: string[];
  };
  analytics: {
    avgResponseTime?: number;
    topicProgress?: Record<string, { attempts: number; avgScore: number }>;
    completionRate?: number;
  };
  weaknesses: Record<string, { score: number; lastAttempt: string }>;
  lastActivityDate?: string;
}

export interface PersonalizedGreeting {
  timeGreeting: string;
  emoji: string;
  streakDays: number;
  totalXP: number;
  currentLevel: number;
  streakMessage?: string;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  levelProgress: number;
}

export interface Recommendations {
  topicsToImprove: string[];
  suggestedDifficulty: string;
  newTopicsToExplore: string[];
  dailyGoal: number;
  exercisesToday: number;
  dailyGoalReached: boolean;
}

export interface ApiClient {
  getCurrentUser: () => Promise<User>;
  getTodayQuiz: () => Promise<Quiz>;
  submitExercise: (exerciseId: string, answers: { questionId: string; answer: number }[]) => Promise<SubmitAnswersResponse>;
  getHistory: () => Promise<ExerciseHistory[]>;
  chatWithAI: (message: string, context?: string) => Promise<{ response: string; context?: string }>;
  getAIProfile: () => Promise<AIProfile>;
  getPersonalizedGreeting: () => Promise<PersonalizedGreeting>;
  getRecommendations: () => Promise<Recommendations>;
  updatePreferences: (preferences: Record<string, unknown>) => Promise<AIProfile>;
}

export function useApi(authToken: string | null) {
  const apiClient = useMemo(() => {
    if (!authToken) return null;

    const client: AxiosInstance = axios.create({
      baseURL: config.backendBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    return {
      getCurrentUser: async () => {
        const response = await client.get<User>('/api/user/me');
        return response.data;
      },

      getTodayQuiz: async () => {
        const response = await client.get<Quiz>('/api/quiz/today');
        return response.data;
      },

      submitExercise: async (exerciseId: string, answers: { questionId: string; answer: number }[]) => {
        // Format attendu par le backend: { detailsJSON: { answers: [...] } }
        const response = await client.post<SubmitAnswersResponse>(
          `/api/exercise/${exerciseId}/submit`,
          { detailsJSON: { answers } }
        );
        return response.data;
      },

      getHistory: async () => {
        const response = await client.get<ExerciseHistory[]>('/api/exercises/history');
        return response.data;
      },

      chatWithAI: async (message: string, context?: string) => {
        const response = await client.post<{ response: string; context?: string }>(
          '/api/ai/chat',
          { message, context }
        );
        return response.data;
      },

      getAIProfile: async () => {
        const response = await client.get<AIProfile>('/api/profile');
        return response.data;
      },

      getPersonalizedGreeting: async () => {
        const response = await client.get<PersonalizedGreeting>('/api/profile/greeting');
        return response.data;
      },

      getRecommendations: async () => {
        const response = await client.get<Recommendations>('/api/profile/recommendations');
        return response.data;
      },

      updatePreferences: async (preferences: Record<string, unknown>) => {
        const response = await client.put<AIProfile>('/api/profile/preferences', preferences);
        return response.data;
      },
    } as ApiClient;
  }, [authToken]);

  return { apiClient };
}

