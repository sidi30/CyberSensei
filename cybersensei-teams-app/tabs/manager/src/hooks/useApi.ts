import { useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import type { User, ManagerMetrics, ManagerUser, Settings } from '../types';

export interface ApiClient {
  getCurrentUser: () => Promise<User>;
  getManagerMetrics: () => Promise<ManagerMetrics>;
  getManagerUsers: (filters?: { department?: string; topic?: string }) => Promise<ManagerUser[]>;
  getUserDetails: (userId: string) => Promise<ManagerUser>;
  saveSettings: (settings: Settings) => Promise<void>;
  getSettings: () => Promise<Settings>;
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

      getManagerMetrics: async () => {
        const response = await client.get<ManagerMetrics>('/api/manager/metrics');
        return response.data;
      },

      getManagerUsers: async (filters?: { department?: string; topic?: string }) => {
        const response = await client.get<ManagerUser[]>('/api/manager/users', {
          params: filters,
        });
        return response.data;
      },

      getUserDetails: async (userId: string) => {
        const response = await client.get<ManagerUser>(`/api/manager/users/${userId}`);
        return response.data;
      },

      saveSettings: async (settings: Settings) => {
        await client.post('/api/settings/save', settings);
      },

      getSettings: async () => {
        const response = await client.get<Settings>('/api/settings');
        return response.data;
      },
    } as ApiClient;
  }, [authToken]);

  return { apiClient };
}

