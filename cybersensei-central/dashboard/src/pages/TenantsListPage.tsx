import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Server, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { Tenant, TenantMetric } from '../types';
import { formatRelativeTime, getTenantHealth, getHealthColor, getHealthLabel } from '../lib/utils';

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsWithMetrics, setTenantsWithMetrics] = useState<Map<string, TenantMetric>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);

      // Charger la dernière métrique pour chaque tenant
      const metricsMap = new Map();
      await Promise.all(
        data.map(async (tenant) => {
          try {
            const result = await api.getLatestMetric(tenant.id);
            metricsMap.set(tenant.id, result.metric);
          } catch (err) {
            // Pas de métrique disponible
          }
        })
      );
      setTenantsWithMetrics(metricsMap);
    } catch (err) {
      console.error('Erreur chargement tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">Gérez tous les clients de la plateforme</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Tenant
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => {
                const metric = tenantsWithMetrics.get(tenant.id);
                const health = getTenantHealth(metric?.timestamp || null);
                const healthColor = getHealthColor(health);
                const healthLabel = getHealthLabel(health);

                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthColor}`}>
                        {healthLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric?.version || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric?.activeUsers || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric ? formatRelativeTime(metric.timestamp) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/tenants/${tenant.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun tenant trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? 'Aucun tenant ne correspond à votre recherche'
                : 'Commencez par créer un nouveau tenant'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

