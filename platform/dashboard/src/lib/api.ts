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
  Exercise,
  ExerciseStats,
  AiConfig,
  AiProvider,
  GenerationFrequency,
  Subscription,
  SubscriptionStats,
  PlanType,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - attach JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
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

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
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
    this.setUser(data.user as User);
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
    const { data } = await this.client.get<Tenant[]>('/admin/tenants');
    return data;
  }

  async getTenant(id: string): Promise<Tenant> {
    const { data } = await this.client.get<Tenant>(`/admin/tenants/${id}`);
    return data;
  }

  async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    const { data } = await this.client.post<Tenant>('/admin/tenants', tenantData);
    return data;
  }

  async updateTenant(id: string, tenantData: Partial<CreateTenantData>): Promise<Tenant> {
    const { data } = await this.client.patch<Tenant>(`/admin/tenants/${id}`, tenantData);
    return data;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.client.delete(`/admin/tenants/${id}`);
  }

  // ============================================
  // LICENSES
  // ============================================

  async getLicenses(): Promise<License[]> {
    const { data } = await this.client.get<License[]>('/api/license');
    return data;
  }

  async getTenantLicenses(tenantId: string): Promise<License[]> {
    const { data } = await this.client.get<License[]>(`/admin/tenants/${tenantId}/licenses`);
    return data;
  }

  // ============================================
  // METRICS
  // ============================================

  async getTenantMetrics(
    tenantId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<PaginatedResponse<TenantMetric>> {
    const { data } = await this.client.get<PaginatedResponse<TenantMetric>>(
      `/admin/tenants/${tenantId}/metrics`,
      { params: { limit, offset } },
    );
    return data;
  }

  async getLatestMetric(tenantId: string): Promise<{ tenantId: string; tenantName: string; metric: TenantMetric }> {
    const { data } = await this.client.get(`/admin/tenants/${tenantId}/metrics/latest`);
    return data;
  }

  async getAggregatedMetrics(
    tenantId: string,
    period: '24h' | '7d' | '30d' = '7d',
  ): Promise<AggregatedMetrics> {
    const { data } = await this.client.get<AggregatedMetrics>(
      `/admin/tenants/${tenantId}/metrics/aggregated`,
      { params: { period } },
    );
    return data;
  }

  async getGlobalSummary(): Promise<GlobalSummary> {
    const { data } = await this.client.get<GlobalSummary>('/admin/global/summary');
    return data;
  }

  async getUsageTrends(days: number = 30): Promise<UsageTrends> {
    const { data } = await this.client.get<UsageTrends>('/admin/global/usage-trends', {
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

  // ============================================
  // EXERCISES
  // ============================================

  async getExercises(): Promise<Exercise[]> {
    const { data } = await this.client.get<Exercise[]>('/admin/exercises');
    return data;
  }

  async getExerciseStats(): Promise<ExerciseStats> {
    const { data } = await this.client.get<ExerciseStats>('/admin/exercises/stats');
    return data;
  }

  // ============================================
  // AI EXERCISE GENERATION
  // ============================================

  async getAiConfig(tenantId: string): Promise<AiConfig> {
    const { data } = await this.client.get<AiConfig>(`/admin/ai-exercises/config/${tenantId}`);
    return data;
  }

  async createAiConfig(config: {
    tenantId: string;
    provider: AiProvider;
    apiKey: string;
    enabled?: boolean;
    generationFrequency?: GenerationFrequency;
  }): Promise<AiConfig> {
    const { data } = await this.client.post<AiConfig>('/admin/ai-exercises/config', config);
    return data;
  }

  async updateAiConfig(tenantId: string, config: {
    provider?: AiProvider;
    apiKey?: string;
    enabled?: boolean;
    generationFrequency?: GenerationFrequency;
  }): Promise<AiConfig> {
    const { data } = await this.client.patch<AiConfig>(`/admin/ai-exercises/config/${tenantId}`, config);
    return data;
  }

  async deleteAiConfig(tenantId: string): Promise<void> {
    await this.client.delete(`/admin/ai-exercises/config/${tenantId}`);
  }

  async testAiConfig(tenantId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await this.client.post<{ success: boolean; message: string }>(`/admin/ai-exercises/config/${tenantId}/test`);
    return data;
  }

  async generateExercises(params: {
    tenantId: string;
    topics?: string[];
    difficulty?: string;
    count?: number;
  }): Promise<{ generated: number; exercises: Exercise[] }> {
    const { data } = await this.client.post<{ generated: number; exercises: Exercise[] }>('/admin/ai-exercises/generate', params);
    return data;
  }

  async getGeneratedExercises(): Promise<Exercise[]> {
    const { data } = await this.client.get<Exercise[]>('/admin/ai-exercises/generated');
    return data;
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  async getSubscriptions(): Promise<Subscription[]> {
    const { data } = await this.client.get<Subscription[]>('/subscriptions');
    return data;
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const { data } = await this.client.get<SubscriptionStats>('/subscriptions/stats');
    return data;
  }

  async getSubscriptionByTenant(tenantId: string): Promise<Subscription> {
    const { data } = await this.client.get<Subscription>(`/subscriptions/tenant/${tenantId}`);
    return data;
  }

  async createSubscription(params: {
    tenantId: string;
    plan?: PlanType;
    monthlyPrice?: number;
  }): Promise<Subscription> {
    const { data } = await this.client.post<Subscription>('/subscriptions', params);
    return data;
  }

  async upgradeSubscription(tenantId: string, params: {
    plan?: PlanType;
    status?: string;
    monthlyPrice?: number;
  }): Promise<Subscription> {
    const { data } = await this.client.patch<Subscription>(
      `/subscriptions/tenant/${tenantId}/upgrade`,
      params,
    );
    return data;
  }
  // ============================================
  // INFRASTRUCTURE SCAN
  // ============================================

  async launchInfraScan(tenantId: string, domain: string, emails: string[] = []) {
    const { data } = await this.client.post('/infra-scan/launch', { tenantId, domain, emails });
    return data;
  }

  async getInfraScanHistory(tenantId: string, limit = 20) {
    const { data } = await this.client.get(`/infra-scan/history/${tenantId}`, { params: { limit } });
    return data;
  }

  async getInfraScan(scanId: string) {
    const { data } = await this.client.get(`/infra-scan/${scanId}`);
    return data;
  }

  // ============================================
  // DLP ANALYTICS
  // ============================================

  async getDlpStats(tenantId: string) {
    const { data } = await this.client.get(`/dlp/stats/${tenantId}`);
    return data;
  }

  async getDlpAlerts(tenantId: string, status?: string) {
    const { data } = await this.client.get(`/dlp/alerts/${tenantId}`, { params: status ? { status } : {} });
    return data;
  }

  async resolveDlpAlert(alertId: string) {
    const { data } = await this.client.patch(`/dlp/alerts/${alertId}/resolve`);
    return data;
  }

  async dismissDlpAlert(alertId: string) {
    const { data } = await this.client.patch(`/dlp/alerts/${alertId}/dismiss`);
    return data;
  }

  async getDlpEvents(tenantId: string, limit = 20) {
    const { data } = await this.client.get(`/dlp/events/${tenantId}`, { params: { limit } });
    return data;
  }

  // ============================================
  // AI REPORTS
  // ============================================

  async getReportLevels() {
    const { data } = await this.client.get('/reports/levels');
    return data;
  }

  async generateReportFromScan(scanId: string, level: string) {
    const { data } = await this.client.post(`/reports/generate/${scanId}`, { level });
    return data;
  }

  async generateReportPdf(scanResults: Record<string, any>, level: string): Promise<Blob> {
    const { data } = await this.client.post('/reports/pdf', { scanResults, level }, { responseType: 'blob' });
    return data;
  }

  async emailReport(scanId: string, level: string, recipientEmail: string, companyName: string) {
    const { data } = await this.client.post('/reports/email', { scanId, level, recipientEmail, companyName });
    return data;
  }
}

export const api = new ApiClient();
export default api;
