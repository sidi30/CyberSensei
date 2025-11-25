import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  CompanyMetrics,
  UserMetrics,
  Exercise,
  PhishingResult,
  SMTPConfig,
  FrequencyConfig,
  UpdateStatus,
  LicenseInfo,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Auth API ==========
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/user/me');
    return data;
  },
};

// ========== Manager API ==========
export const managerAPI = {
  getMetrics: async (): Promise<CompanyMetrics> => {
    const { data } = await api.get<CompanyMetrics>('/manager/metrics');
    return data;
  },

  getUserMetrics: async (): Promise<UserMetrics[]> => {
    const { data } = await api.get<UserMetrics[]>('/manager/users-metrics');
    return data;
  },

  getUserDetails: async (userId: number): Promise<UserMetrics> => {
    const { data } = await api.get<UserMetrics>(`/manager/user/${userId}`);
    return data;
  },
};

// ========== User API ==========
export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/user');
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data} = await api.get<User>(`/user/${id}`);
    return data;
  },

  create: async (user: Partial<User>): Promise<User> => {
    const { data } = await api.post<User>('/user', user);
    return data;
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>(`/user/${id}`, user);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/user/${id}`);
  },
};

// ========== Exercise API ==========
export const exerciseAPI = {
  getAll: async (): Promise<Exercise[]> => {
    const { data } = await api.get<Exercise[]>('/exercises');
    return data;
  },

  getById: async (id: number): Promise<Exercise> => {
    const { data } = await api.get<Exercise>(`/exercises/${id}`);
    return data;
  },

  create: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const { data } = await api.post<Exercise>('/exercises', exercise);
    return data;
  },

  update: async (id: number, exercise: Partial<Exercise>): Promise<Exercise> => {
    const { data } = await api.put<Exercise>(`/exercises/${id}`, exercise);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/exercises/${id}`);
  },
};

// ========== Phishing API ==========
export const phishingAPI = {
  getResults: async (): Promise<PhishingResult[]> => {
    const { data } = await api.get<PhishingResult[]>('/phishing/results');
    return data;
  },

  getCampaigns: async (): Promise<any[]> => {
    const { data } = await api.get<any[]>('/phishing/campaigns');
    return data;
  },

  sendCampaign: async (): Promise<void> => {
    await api.post('/phishing/send');
  },

  getTemplates: async (): Promise<any[]> => {
    const { data } = await api.get<any[]>('/phishing/templates');
    return data;
  },
};

// ========== Settings API ==========
export const settingsAPI = {
  getSMTPConfig: async (): Promise<SMTPConfig> => {
    const { data } = await api.get<SMTPConfig>('/settings/smtp');
    return data;
  },

  saveSMTPConfig: async (config: SMTPConfig): Promise<void> => {
    await api.post('/settings/smtp', config);
  },

  getFrequencyConfig: async (): Promise<FrequencyConfig> => {
    const { data } = await api.get<FrequencyConfig>('/settings/frequency');
    return data;
  },

  saveFrequencyConfig: async (config: FrequencyConfig): Promise<void> => {
    await api.post('/settings/frequency', config);
  },

  saveSettings: async (settings: Record<string, any>): Promise<void> => {
    await api.post('/settings/save', settings);
  },
};

// ========== Sync API ==========
export const syncAPI = {
  getStatus: async (): Promise<UpdateStatus> => {
    const { data } = await api.get<UpdateStatus>('/sync/status');
    return data;
  },

  checkForUpdates: async (): Promise<void> => {
    await api.post('/sync/update/check');
  },

  pushTelemetry: async (): Promise<void> => {
    await api.post('/sync/telemetry/push');
  },
};

// ========== License API ==========
export const licenseAPI = {
  getInfo: async (): Promise<LicenseInfo> => {
    const { data } = await api.get<LicenseInfo>('/license/info');
    return data;
  },
};

export default api;


