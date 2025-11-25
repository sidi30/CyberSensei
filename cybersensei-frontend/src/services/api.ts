import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  Exercise,
  UserExerciseResult,
  SubmitExerciseRequest,
  AIChatRequest,
  AIChatResponse,
  CompanyMetrics,
  AuthRequest,
  AuthResponse,
  CompanySettings,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const { data } = await this.api.get<User>('/user/me');
    return data;
  }

  async getUserById(id: number): Promise<User> {
    const { data } = await this.api.get<User>(`/user/${id}`);
    return data;
  }

  // Exercise endpoints
  async getTodayQuiz(): Promise<Exercise> {
    const { data } = await this.api.get<Exercise>('/quiz/today');
    return data;
  }

  async submitExercise(
    exerciseId: number,
    submission: SubmitExerciseRequest
  ): Promise<UserExerciseResult> {
    const { data } = await this.api.post<UserExerciseResult>(
      `/exercise/${exerciseId}/submit`,
      submission
    );
    return data;
  }

  // AI Chat endpoints
  async chatWithAI(request: AIChatRequest): Promise<AIChatResponse> {
    const { data } = await this.api.post<AIChatResponse>('/ai/chat', request);
    return data;
  }

  // Metrics endpoints
  async getCompanyMetrics(): Promise<CompanyMetrics> {
    const { data } = await this.api.get<CompanyMetrics>('/manager/metrics');
    return data;
  }

  // Settings endpoints
  async getSettings(): Promise<CompanySettings> {
    // This endpoint might need to be created in the backend
    const { data } = await this.api.get<CompanySettings>('/settings');
    return data;
  }

  async saveSettings(settings: CompanySettings): Promise<void> {
    await this.api.post('/settings/save', settings);
  }

  // Health check
  async checkHealth(): Promise<any> {
    const { data } = await this.api.get('/health');
    return data;
  }
}

export const apiService = new ApiService();
export default apiService;


