import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Server, Activity, TrendingUp, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import type { Tenant, AggregatedMetrics } from '../types';
import { formatUptime } from '../lib/utils';

export default function TenantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    if (id) {
      loadTenantData(id);
    }
  }, [id, period]);

  const loadTenantData = async (tenantId: string) => {
    try {
      const [tenantData, metricsData] = await Promise.all([
        api.getTenant(tenantId),
        api.getAggregatedMetrics(tenantId, period),
      ]);
      setTenant(tenantData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Erreur chargement:', err);
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

  if (!tenant || !metrics) {
    return (
      <div className="card">
        <p className="text-danger-600">Tenant non trouvé</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Utilisateurs Actifs',
      value: metrics.metrics.avgActiveUsers.toFixed(1),
      trend: metrics.trend?.activeUsers,
      icon: Activity,
    },
    {
      name: 'Exercices/Jour',
      value: metrics.metrics.avgExercisesPerDay.toFixed(1),
      trend: metrics.trend?.exercises,
      icon: Package,
    },
    {
      name: 'Latence IA',
      value: metrics.metrics.avgAiLatency ? `${metrics.metrics.avgAiLatency.toFixed(0)}ms` : 'N/A',
      trend: metrics.trend?.aiLatency,
      icon: TrendingUp,
    },
    {
      name: 'Uptime Moyen',
      value: formatUptime(metrics.metrics.avgUptime),
      icon: Server,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/tenants" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux tenants
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-gray-600 mt-1">{tenant.contactEmail}</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['24h', '7d', '30d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {p === '24h' ? '24 heures' : p === '7d' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-gray-400" />
              {stat.trend && stat.trend !== 'n/a' && (
                <span
                  className={`text-xs font-medium ${
                    stat.trend === 'increasing'
                      ? 'text-success-600'
                      : stat.trend === 'decreasing'
                      ? 'text-danger-600'
                      : 'text-gray-600'
                  }`}
                >
                  {stat.trend === 'increasing' ? '↗' : stat.trend === 'decreasing' ? '↘' : '→'}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercices Complétés</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="exercises" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Total sur la période : {metrics.metrics.totalExercises} exercices
        </p>
      </div>

      {/* License Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Clé de licence</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{tenant.licenseKey}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Statut</dt>
            <dd className="mt-1">
              <span className={`badge ${tenant.active ? 'badge-success' : 'badge-danger'}`}>
                {tenant.active ? 'Actif' : 'Inactif'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Créé le</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dernière mise à jour</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(tenant.updatedAt).toLocaleDateString('fr-FR')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

