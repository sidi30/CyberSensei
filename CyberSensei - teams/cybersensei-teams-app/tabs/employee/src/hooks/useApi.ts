import { useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import type {
  User,
  Quiz,
  ExerciseHistory,
  SubmitAnswersResponse,
} from '../types';

export interface ApiClient {
  getCurrentUser: () => Promise<User>;
  getTodayQuiz: () => Promise<Quiz>;
  submitExercise: (exerciseId: string, answers: { questionId: string; answer: number }[]) => Promise<SubmitAnswersResponse>;
  getHistory: () => Promise<ExerciseHistory[]>;
  chatWithAI: (message: string, context?: string) => Promise<{ response: string; context?: string }>;
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
        const response = await client.post<SubmitAnswersResponse>(
          `/api/exercise/${exerciseId}/submit`,
          { answers }
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
    } as ApiClient;
  }, [authToken]);

  return { apiClient };
}

