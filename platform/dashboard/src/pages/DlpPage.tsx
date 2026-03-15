import { useState, useEffect } from 'react';
import { ShieldAlert, Eye, Ban, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

interface DlpStats {
  totalEvents: number;
  blockedEvents: number;
  highRiskEvents: number;
  openAlerts: number;
  blockRate: number;
}

interface DlpAlert {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface DlpEvent {
  id: string;
  tenantId: string;
  userId: string;
  riskScore: number;
  riskLevel: string;
  aiTool: string;
  blocked: boolean;
  createdAt: string;
}

export default function DlpPage() {
  const [stats, setStats] = useState<DlpStats | null>(null);
  const [alerts, setAlerts] = useState<DlpAlert[]>([]);
  const [events, setEvents] = useState<DlpEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) loadDlpData(selectedTenantId);
  }, [selectedTenantId]);

  const loadTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);
      if (data.length > 0) setSelectedTenantId(data[0].id);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    }
  };

  const loadDlpData = async (tenantId: string) => {
    try {
      setLoading(true);
      const [statsRes, alertsRes, eventsRes] = await Promise.all([
        (api as any).client.get(`/dlp/stats/${tenantId}`),
        (api as any).client.get(`/dlp/alerts/${tenantId}`),
        (api as any).client.get(`/dlp/events/${tenantId}?limit=20`),
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Failed to load DLP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    await (api as any).client.patch(`/dlp/alerts/${alertId}/resolve`);
    if (selectedTenantId) loadDlpData(selectedTenantId);
  };

  const handleDismiss = async (alertId: string) => {
    await (api as any).client.patch(`/dlp/alerts/${alertId}/dismiss`);
    if (selectedTenantId) loadDlpData(selectedTenantId);
  };

  const getRiskBadge = (level: string) => {
    const styles: Record<string, string> = {
      SAFE: 'bg-green-100 text-green-800',
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return styles[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DLP Analytics</h1>
          <p className="text-gray-500">Protection contre les fuites de données via IA</p>
        </div>
        <ShieldAlert className="h-8 w-8 text-primary-600" />
      </div>

      {/* Tenant Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un tenant</label>
        <select
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm px-3 py-2 border"
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name || t.domain}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Chargement...</div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Prompts analysés</p>
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <Ban className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Prompts bloqués</p>
                    <p className="text-2xl font-bold text-red-600">{stats.blockedEvents}</p>
                    <p className="text-xs text-gray-400">{stats.blockRate}% taux de blocage</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <ShieldAlert className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Risque élevé</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.highRiskEvents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex items-center">
                  <ShieldAlert className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Alertes ouvertes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.openAlerts}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Alertes DLP</h2>
            </div>
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Aucune alerte</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                          {alert.severity}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${alert.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : alert.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                    {alert.status === 'OPEN' && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleResolve(alert.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Résoudre">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDismiss(alert.id)} className="p-1 text-gray-400 hover:bg-gray-50 rounded" title="Ignorer">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Événements récents</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outil IA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bloqué</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{event.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{event.aiTool}</td>
                    <td className="px-6 py-4 text-sm font-medium">{event.riskScore}/100</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRiskBadge(event.riskLevel)}`}>
                        {event.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.blocked ? <Ban className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(event.createdAt).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
