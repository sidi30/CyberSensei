import axios from 'axios';
import type { M365Score, M365Scan, M365Finding, M365Alert, ConnectionStatus } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3006';

const api = axios.create({
  baseURL: API_BASE,
});

// Inject tenant token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('m365_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getTenantId(): string {
  return localStorage.getItem('m365_tenant_id') || '';
}

// Auth
export const getConnectionStatus = () =>
  api.get<ConnectionStatus>(`/m365/auth/status/${getTenantId()}`).then((r) => r.data);

export const getConnectUrl = () =>
  `${API_BASE}/m365/auth/connect/${getTenantId()}`;

export const disconnect = () =>
  api.delete(`/m365/auth/disconnect/${getTenantId()}`).then((r) => r.data);

// Score
export const getLatestScore = () =>
  api.get<M365Score>(`/m365/score/tenant/${getTenantId()}/latest`).then((r) => r.data);

export const getScoreHistory = (limit = 30) =>
  api.get<M365Score[]>(`/m365/score/tenant/${getTenantId()}/history`, { params: { limit } }).then((r) => r.data);

// Scan
export const triggerScan = (categories?: string) =>
  api.post(`/m365/scan/trigger/${getTenantId()}`, null, { params: { categories } }).then((r) => r.data);

export const getLatestScan = () =>
  api.get<M365Scan>(`/m365/scan/tenant/${getTenantId()}/latest`).then((r) => r.data);

export const getScan = (scanId: string) =>
  api.get<M365Scan>(`/m365/scan/${scanId}`).then((r) => r.data);

export const getScanHistory = (limit = 20, offset = 0) =>
  api.get<{ scans: M365Scan[]; total: number }>(`/m365/scan/tenant/${getTenantId()}/history`, { params: { limit, offset } }).then((r) => r.data);

export const getScanFindings = (scanId: string, category?: string, severity?: string, limit = 50, offset = 0) =>
  api.get<{ findings: M365Finding[]; total: number }>(`/m365/scan/${scanId}/findings`, { params: { category, severity, limit, offset } }).then((r) => r.data);

// Report
export const generateReport = (scanId: string) =>
  api.post<{ reportId: string; filename: string }>(`/m365/report/generate/${scanId}`).then((r) => r.data);

export const getReportDownloadUrl = (reportId: string) =>
  `${API_BASE}/m365/report/download/${reportId}`;

// Alerts
export const getAlerts = (limit = 50, offset = 0) =>
  api.get<{ alerts: M365Alert[]; total: number }>(`/m365/alert/tenant/${getTenantId()}`, { params: { limit, offset } }).then((r) => r.data);

export const acknowledgeAlert = (alertId: string) =>
  api.post(`/m365/alert/${alertId}/acknowledge`).then((r) => r.data);
