import { useEffect, useState } from 'react';
import { managerAPI } from '../services/api';
import type { CompanyMetrics } from '../types';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

export default function Overview() {
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await managerAPI.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des métriques');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
        <p className="text-danger-800">{error}</p>
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-success-600 bg-success-100';
      case 'MEDIUM': return 'text-warning-600 bg-warning-100';
      case 'HIGH': return 'text-danger-600 bg-danger-100';
      case 'CRITICAL': return 'text-danger-800 bg-danger-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-gray-600 mt-1">Métriques de sécurité de votre entreprise</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score Global */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Score Global</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.score || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-success-600">+5.2% vs dernier mois</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Niveau de Risque</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(metrics?.riskLevel || 'MEDIUM')}`}>
                {metrics?.riskLevel || 'MEDIUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Users className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.activeUsers || 0}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            sur {metrics?.totalUsers || 0} total
          </p>
        </div>

        {/* Participation Rate */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Taux de Participation</p>
              <p className="text-3xl font-bold text-gray-900">
                {metrics?.participationRate || 0}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${metrics?.participationRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Evolution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Score</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder - Use Recharts here</p>
          </div>
        </div>

        {/* Phishing Success Rate */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Réussite Phishing</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder - Use Recharts here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <p className="text-sm text-gray-700">
                Activité #{i} - Placeholder
              </p>
              <span className="ml-auto text-xs text-gray-500">Il y a {i}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


