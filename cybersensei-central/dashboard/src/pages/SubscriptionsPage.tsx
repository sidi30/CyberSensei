import { useEffect, useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Users,
  Crown,
  ArrowUpCircle,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import api from '../lib/api';
import type {
  Subscription,
  SubscriptionStats,
  Tenant,
} from '../types';
import {
  PlanType,
  SubscriptionStatus,
  PLAN_LABELS,
  PLAN_PRICES,
  SUBSCRIPTION_STATUS_LABELS,
} from '../types';

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [SubscriptionStatus.TRIAL]: 'bg-blue-100 text-blue-800',
  [SubscriptionStatus.PAST_DUE]: 'bg-red-100 text-red-800',
  [SubscriptionStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [SubscriptionStatus.EXPIRED]: 'bg-yellow-100 text-yellow-800',
};

const PLAN_BADGE_STYLES: Record<PlanType, string> = {
  [PlanType.FREE]: 'bg-gray-100 text-gray-700 border-gray-300',
  [PlanType.STARTER]: 'bg-blue-100 text-blue-700 border-blue-300',
  [PlanType.BUSINESS]: 'bg-purple-100 text-purple-700 border-purple-300',
  [PlanType.ENTERPRISE]: 'bg-amber-100 text-amber-700 border-amber-300',
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState<PlanType>(PlanType.STARTER);
  const [upgrading, setUpgrading] = useState(false);

  // Create subscription modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTenantId, setCreateTenantId] = useState('');
  const [createPlan, setCreatePlan] = useState<PlanType>(PlanType.FREE);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subsData, statsData, tenantsData] = await Promise.all([
        api.getSubscriptions(),
        api.getSubscriptionStats(),
        api.getTenants(),
      ]);
      setSubscriptions(subsData);
      setStats(statsData);
      setTenants(tenantsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgrade = async () => {
    if (!selectedSub) return;
    try {
      setUpgrading(true);
      setError('');
      await api.upgradeSubscription(selectedSub.tenantId, { plan: newPlan });
      setSuccess(`Plan mis à jour vers ${PLAN_LABELS[newPlan]} avec succès`);
      setShowUpgradeModal(false);
      setSelectedSub(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du plan');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCreate = async () => {
    if (!createTenantId) return;
    try {
      setCreating(true);
      setError('');
      await api.createSubscription({ tenantId: createTenantId, plan: createPlan });
      setSuccess('Abonnement créé avec succès');
      setShowCreateModal(false);
      setCreateTenantId('');
      setCreatePlan(PlanType.FREE);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  // Tenants without a subscription
  const tenantsWithoutSub = tenants.filter(
    (t) => !subscriptions.some((s) => s.tenantId === t.id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des plans et suivi du MRR
          </p>
        </div>
        {tenantsWithoutSub.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Attribuer un plan
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <Check className="h-4 w-4 mr-2" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">&times;</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">MRR</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats.mrr.toFixed(0)} EUR
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500">Gratuit</p>
            <p className="mt-2 text-2xl font-bold text-gray-500">{stats.byPlan.FREE || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500">Starter</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{stats.byPlan.STARTER || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Business+</p>
              <Crown className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {(stats.byPlan.BUSINESS || 0) + (stats.byPlan.ENTERPRISE || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {stats && stats.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel de conversion</h2>
          <div className="flex items-center space-x-2">
            {Object.values(PlanType).map((plan) => {
              const count = stats.byPlan[plan] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={plan} className="flex-1">
                  <div className="text-center mb-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${PLAN_BADGE_STYLES[plan]}`}>
                      {PLAN_LABELS[plan]}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        plan === PlanType.FREE
                          ? 'bg-gray-400'
                          : plan === PlanType.STARTER
                            ? 'bg-blue-500'
                            : plan === PlanType.BUSINESS
                              ? 'bg-purple-500'
                              : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    {count} ({pct}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des abonnements ({subscriptions.length})
          </h2>
        </div>
        {subscriptions.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Aucun abonnement. Attribuez un plan à vos tenants.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage exercices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Users actifs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fin période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => {
                  const limits = getPlanExerciseLimit(sub.plan);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {sub.tenant?.name || sub.tenantId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PLAN_BADGE_STYLES[sub.plan]}`}
                        >
                          {sub.plan === PlanType.ENTERPRISE && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {PLAN_LABELS[sub.plan]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[sub.status]}`}
                        >
                          {SUBSCRIPTION_STATUS_LABELS[sub.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {Number(sub.monthlyPrice) > 0
                          ? `${Number(sub.monthlyPrice).toFixed(0)} EUR/mois`
                          : 'Gratuit'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${
                                limits === -1
                                  ? 'bg-green-500'
                                  : sub.currentMonthExercises / limits > 0.8
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                              }`}
                              style={{
                                width:
                                  limits === -1
                                    ? '100%'
                                    : `${Math.min((sub.currentMonthExercises / limits) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {sub.currentMonthExercises}
                            {limits === -1 ? '' : `/${limits}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {sub.activeUsers}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sub.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {sub.plan !== PlanType.ENTERPRISE && (
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              // Pre-select next plan
                              const planOrder = [
                                PlanType.FREE,
                                PlanType.STARTER,
                                PlanType.BUSINESS,
                                PlanType.ENTERPRISE,
                              ];
                              const currentIdx = planOrder.indexOf(sub.plan);
                              setNewPlan(
                                planOrder[Math.min(currentIdx + 1, planOrder.length - 1)],
                              );
                              setShowUpgradeModal(true);
                            }}
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                          >
                            <ArrowUpCircle className="h-4 w-4 mr-1" />
                            Changer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Changer le plan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Tenant : <strong>{selectedSub.tenant?.name || selectedSub.tenantId.slice(0, 8)}</strong>
              <br />
              Plan actuel : <span className={`font-medium`}>{PLAN_LABELS[selectedSub.plan]}</span>
            </p>

            <div className="space-y-3 mb-6">
              {Object.values(PlanType)
                .filter((p) => p !== selectedSub.plan)
                .map((plan) => (
                  <label
                    key={plan}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      newPlan === plan
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan}
                      checked={newPlan === plan}
                      onChange={() => setNewPlan(plan)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${PLAN_BADGE_STYLES[plan].split(' ')[1]}`}>
                          {PLAN_LABELS[plan]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {PLAN_PRICES[plan]}
                        </span>
                      </div>
                    </div>
                    {newPlan === plan && (
                      <Check className="h-4 w-4 text-primary-600 ml-2" />
                    )}
                  </label>
                ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedSub(null);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="inline-flex items-center px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {upgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                )}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attribuer un plan
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant
                </label>
                <select
                  value={createTenantId}
                  onChange={(e) => setCreateTenantId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un tenant...</option>
                  {tenantsWithoutSub.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.contactEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <div className="space-y-2">
                  {Object.values(PlanType).map((plan) => (
                    <label
                      key={plan}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        createPlan === plan
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="createPlan"
                        value={plan}
                        checked={createPlan === plan}
                        onChange={() => setCreatePlan(plan)}
                        className="sr-only"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {PLAN_LABELS[plan]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {PLAN_PRICES[plan]}
                        </span>
                      </div>
                      {createPlan === plan && (
                        <Check className="h-4 w-4 text-primary-600 ml-2" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateTenantId('');
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createTenantId}
                className="inline-flex items-center px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Créer l'abonnement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlanExerciseLimit(plan: PlanType): number {
  const limits: Record<PlanType, number> = {
    [PlanType.FREE]: 5,
    [PlanType.STARTER]: 20,
    [PlanType.BUSINESS]: -1,
    [PlanType.ENTERPRISE]: -1,
  };
  return limits[plan];
}
