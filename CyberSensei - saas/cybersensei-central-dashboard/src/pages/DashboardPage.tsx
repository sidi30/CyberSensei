import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import type { GlobalSummary } from '../types';
import { formatCompactNumber } from '../lib/utils';

export default function DashboardPage() {
  const [summary, setSummary] = useState<GlobalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getGlobalSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-danger-600">
          <AlertTriangle className="h-6 w-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      name: 'Tenants Actifs',
      value: summary.tenants.active,
      total: summary.tenants.total,
      icon: Server,
      color: 'text-primary-600 bg-primary-100',
    },
    {
      name: 'Utilisateurs Actifs',
      value: formatCompactNumber(summary.usage.totalActiveUsers),
      icon: Users,
      color: 'text-success-600 bg-success-100',
    },
    {
      name: 'Exercices Complétés',
      value: formatCompactNumber(summary.usage.totalExercisesCompletedToday),
      icon: Activity,
      color: 'text-warning-600 bg-warning-100',
    },
    {
      name: 'Latence IA Moyenne',
      value: summary.usage.averageAiLatency
        ? `${summary.usage.averageAiLatency.toFixed(0)}ms`
        : 'N/A',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  const healthStats = [
    { name: 'Sains', value: summary.health.healthy, color: 'text-success-600' },
    { name: 'Attention', value: summary.health.warning, color: 'text-warning-600' },
    { name: 'Critiques', value: summary.health.critical, color: 'text-danger-600' },
    { name: 'Pas de données', value: summary.health.noData, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Global</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme CyberSensei</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                  {stat.total && <span className="text-sm text-gray-500">/{stat.total}</span>}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Santé des Tenants</h3>
          <div className="space-y-3">
            {healthStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.name}</span>
                <span className={`text-lg font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <Link to="/tenants" className="mt-4 btn-primary btn-sm w-full">
            Voir tous les tenants
          </Link>
        </div>

        {/* Licenses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Licences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {summary.licenses.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actives</span>
              <span className="text-lg font-semibold text-success-600">
                {summary.licenses.active}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expirées</span>
              <span className="text-lg font-semibold text-danger-600">
                {summary.licenses.expired}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expirant bientôt</span>
              <span className="text-lg font-semibold text-warning-600">
                {summary.licenses.expiringSoon}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Versions Distribution */}
      {summary.versions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribution des Versions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {summary.versions.map((version) => (
              <div key={version.version} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{version.count}</div>
                <div className="text-sm text-gray-600 mt-1">v{version.version}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Alerts */}
      {summary.health.critical > 0 && (
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-danger-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-danger-900 mb-2">
                Alertes Critiques
              </h3>
              <p className="text-danger-800">
                {summary.health.critical} tenant(s) en état critique. Vérifiez immédiatement.
              </p>
              <Link to="/tenants" className="mt-3 inline-flex items-center text-sm font-medium text-danger-700 hover:text-danger-900">
                Voir les détails →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

