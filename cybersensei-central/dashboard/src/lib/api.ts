import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  CreateAdminData,
  Tenant,
  CreateTenantData,
  License,
  TenantMetric,
  AggregatedMetrics,
  GlobalSummary,
  UsageTrends,
  UpdateMetadata,
  UpdateCheckResponse,
  ApiError,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ⚠️ MODE BYPASS - Intercepteurs désactivés
    // Intercepteur de requête pour ajouter le token - DÉSACTIVÉ
    this.client.interceptors.request.use(
      (config) => {
        // Ne plus ajouter de token JWT
        console.warn('⚠️ MODE BYPASS - Pas de token JWT ajouté');
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs - DÉSACTIVÉ
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Ne plus rediriger vers /login en cas d'erreur 401
        console.warn('⚠️ MODE BYPASS - Erreur 401 ignorée, pas de redirection');
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('access_token');
  }

  private setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private clearUser(): void {
    localStorage.removeItem('user');
  }

  clearAuth(): void {
    this.clearToken();
    this.clearUser();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await this.client.post<LoginResponse>('/auth/login', credentials);
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async getProfile(): Promise<User> {
    const { data } = await this.client.get<User>('/auth/me');
    this.setUser(data);
    return data;
  }

  async register(adminData: CreateAdminData): Promise<User> {
    const { data } = await this.client.post<User>('/auth/register', adminData);
    return data;
  }

  async getAllAdmins(): Promise<User[]> {
    const { data } = await this.client.get<User[]>('/auth/admins');
    return data;
  }

  logout(): void {
    this.clearAuth();
  }

  // ============================================
  // TENANTS
  // ============================================

  async getTenants(): Promise<Tenant[]> {
    const { data } = await this.client.get<Tenant[]>('/admin/tenant');
    return data;
  }

  async getTenant(id: string): Promise<Tenant> {
    const { data } = await this.client.get<Tenant>(`/admin/tenant/${id}`);
    return data;
  }

  async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    const { data } = await this.client.post<Tenant>('/admin/tenant', tenantData);
    return data;
  }

  async updateTenant(id: string, tenantData: Partial<CreateTenantData>): Promise<Tenant> {
    const { data } = await this.client.patch<Tenant>(`/admin/tenant/${id}`, tenantData);
    return data;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.client.delete(`/admin/tenant/${id}`);
  }

  // ============================================
  // LICENSES
  // ============================================

  async getLicenses(): Promise<License[]> {
    const { data } = await this.client.get<License[]>('/admin/license');
    return data;
  }

  async getTenantLicenses(tenantId: string): Promise<License[]> {
    const { data } = await this.client.get<License[]>(`/admin/tenant/${tenantId}/licenses`);
    return data;
  }

  // ============================================
  // METRICS
  // ============================================

  async getTenantMetrics(
    tenantId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<PaginatedResponse<TenantMetric>> {
    const { data } = await this.client.get<PaginatedResponse<TenantMetric>>(
      `/admin/tenant/${tenantId}/metrics`,
      { params: { limit, offset } }
    );
    return data;
  }

  async getLatestMetric(tenantId: string): Promise<{ tenantId: string; tenantName: string; metric: TenantMetric }> {
    const { data } = await this.client.get(`/admin/tenant/${tenantId}/metrics/latest`);
    return data;
  }

  async getAggregatedMetrics(
    tenantId: string,
    period: '24h' | '7d' | '30d' = '7d'
  ): Promise<AggregatedMetrics> {
    const { data } = await this.client.get<AggregatedMetrics>(
      `/admin/tenant/${tenantId}/metrics/aggregated`,
      { params: { period } }
    );
    return data;
  }

  async getGlobalSummary(): Promise<GlobalSummary> {
    const { data } = await this.client.get<GlobalSummary>('/admin/global/summary');
    return data;
  }

  async getUsageTrends(days: number = 30): Promise<UsageTrends> {
    const { data} = await this.client.get<UsageTrends>('/admin/global/usage-trends', {
      params: { days },
    });
    return data;
  }

  // ============================================
  // UPDATES
  // ============================================

  async getUpdates(): Promise<UpdateMetadata[]> {
    const { data } = await this.client.get<UpdateMetadata[]>('/admin/update');
    return data;
  }

  async uploadUpdate(file: File): Promise<UpdateMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.client.post<UpdateMetadata>('/admin/update/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async checkUpdate(tenantId: string, version: string): Promise<UpdateCheckResponse> {
    const { data } = await this.client.get<UpdateCheckResponse>('/update/check', {
      params: { tenantId, version },
    });
    return data;
  }

  async downloadUpdate(updateId: string): Promise<Blob> {
    const { data } = await this.client.get(`/update/download/${updateId}`, {
      responseType: 'blob',
    });
    return data;
  }
}

export const api = new ApiClient();
export default api;

