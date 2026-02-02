import { useState, useEffect } from 'react';
import type { ApiClient } from '../hooks/useApi';
import type { ManagerMetrics } from '../types';
import { Trophy, Users, TrendingUp, Clock, Loader2, RefreshCw } from 'lucide-react';

interface KPISectionProps {
  apiClient: ApiClient;
}

export function KPISection({ apiClient }: KPISectionProps) {
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getManagerMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError('Impossible de charger les metriques. Verifiez la connexion au backend.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const participationRate = metrics 
    ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100)
    : 0;

  if (loading && !metrics) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-red-700 font-medium mb-2">Erreur de chargement</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec dernière mise à jour */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Indicateurs clés</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Mis à jour : {lastUpdate.toLocaleTimeString('fr-FR')}</span>
          </div>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Entreprise */}
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-primary-700">
              Score Entreprise
            </span>
            <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-4xl font-bold text-primary-900">
              {metrics?.companyScore || 0}
            </span>
            <span className="text-lg text-primary-700">/ 100</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-primary-700">
            <TrendingUp className="w-3 h-3" />
            <span>Objectif : 85+</span>
          </div>
        </div>

        {/* Taux de Participation */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-green-700">
              Taux de Participation
            </span>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-4xl font-bold text-green-900">
              {participationRate}
            </span>
            <span className="text-lg text-green-700">%</span>
          </div>
          <div className="text-xs text-green-700">
            {metrics?.activeUsers || 0} / {metrics?.totalUsers || 0} utilisateurs actifs
          </div>
        </div>

        {/* Score Moyen */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-700">
              Score Moyen
            </span>
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-4xl font-bold text-purple-900">
              {metrics?.averageScore.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-purple-700">%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.averageScore || 0}%` }}
            />
          </div>
        </div>

        {/* Exercices Complétés */}
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-orange-700">
              Exercices Complétés
            </span>
            <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-4xl font-bold text-orange-900">
              {metrics?.completedExercises || 0}
            </span>
          </div>
          <div className="text-xs text-orange-700">
            Total sur toute la plateforme
          </div>
        </div>
      </div>
    </div>
  );
}

