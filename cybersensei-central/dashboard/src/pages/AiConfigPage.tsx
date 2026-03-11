import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Key,
  Loader2,
  Save,
  Trash2,
  FlaskConical,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Tenant, AiConfig } from '../types';
import { AiProvider, GenerationFrequency, SECTOR_LABELS } from '../types';

const PROVIDER_LABELS: Record<AiProvider, string> = {
  [AiProvider.OPENAI]: 'OpenAI',
  [AiProvider.ANTHROPIC]: 'Claude (Anthropic)',
};

const FREQUENCY_LABELS: Record<GenerationFrequency, string> = {
  [GenerationFrequency.WEEKLY]: 'Hebdomadaire',
  [GenerationFrequency.MONTHLY]: 'Mensuel',
  [GenerationFrequency.ON_DEMAND]: 'À la demande',
};

interface TenantConfigState {
  config: AiConfig | null;
  loading: boolean;
  error: string;
}

export default function AiConfigPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [tenantConfigs, setTenantConfigs] = useState<Map<string, TenantConfigState>>(new Map());

  // Form state
  const [formProvider, setFormProvider] = useState<AiProvider>(AiProvider.OPENAI);
  const [formApiKey, setFormApiKey] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formFrequency, setFormFrequency] = useState<GenerationFrequency>(GenerationFrequency.ON_DEMAND);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTenants();
      setTenants(data);

      // Load config status for all tenants
      const configsMap = new Map<string, TenantConfigState>();
      await Promise.all(
        data.map(async (tenant) => {
          try {
            const config = await api.getAiConfig(tenant.id);
            configsMap.set(tenant.id, { config, loading: false, error: '' });
          } catch {
            configsMap.set(tenant.id, { config: null, loading: false, error: '' });
          }
        })
      );
      setTenantConfigs(configsMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des tenants');
    } finally {
      setLoading(false);
    }
  };

  const toggleTenant = (tenantId: string) => {
    if (expandedTenant === tenantId) {
      setExpandedTenant(null);
      resetForm();
      return;
    }

    setExpandedTenant(tenantId);
    resetForm();

    const configState = tenantConfigs.get(tenantId);
    if (configState?.config) {
      setFormProvider(configState.config.provider);
      setFormEnabled(configState.config.enabled);
      setFormFrequency(configState.config.generationFrequency);
      setFormApiKey('');
    }
  };

  const resetForm = () => {
    setFormProvider(AiProvider.OPENAI);
    setFormApiKey('');
    setFormEnabled(true);
    setFormFrequency(GenerationFrequency.ON_DEMAND);
    setSaveError('');
    setSaveSuccess('');
    setTestResult(null);
  };

  const handleSave = async (tenantId: string) => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const configState = tenantConfigs.get(tenantId);
    const isUpdate = !!configState?.config;

    try {
      let config: AiConfig;
      if (isUpdate) {
        config = await api.updateAiConfig(tenantId, {
          provider: formProvider,
          apiKey: formApiKey || undefined,
          enabled: formEnabled,
          generationFrequency: formFrequency,
        });
      } else {
        if (!formApiKey) {
          setSaveError('La clé API est requise pour une nouvelle configuration');
          setSaving(false);
          return;
        }
        config = await api.createAiConfig({
          tenantId,
          provider: formProvider,
          apiKey: formApiKey,
          enabled: formEnabled,
          generationFrequency: formFrequency,
        });
      }

      setTenantConfigs((prev) => {
        const next = new Map(prev);
        next.set(tenantId, { config, loading: false, error: '' });
        return next;
      });

      setSaveSuccess(isUpdate ? 'Configuration mise à jour' : 'Configuration créée');
      setFormApiKey('');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (tenantId: string) => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await api.testAiConfig(tenantId);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Erreur lors du test',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration IA ?')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteAiConfig(tenantId);
      setTenantConfigs((prev) => {
        const next = new Map(prev);
        next.set(tenantId, { config: null, loading: false, error: '' });
        return next;
      });
      resetForm();
      setSaveSuccess('Configuration supprimée');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-danger-500 mb-4" />
        <p className="text-gray-900 font-medium mb-2">Erreur de chargement</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={loadTenants} className="btn-primary">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration IA</h1>
        <p className="text-gray-600 mt-1">
          Configurez la génération automatique d'exercices par IA pour chaque tenant
        </p>
      </div>

      {/* Tenants List */}
      {tenants.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun tenant</h3>
          <p className="mt-1 text-sm text-gray-500">
            Créez d'abord un tenant pour configurer l'IA
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenants.map((tenant) => {
            const configState = tenantConfigs.get(tenant.id);
            const hasConfig = !!configState?.config;
            const isExpanded = expandedTenant === tenant.id;

            return (
              <div key={tenant.id} className="card p-0 overflow-hidden">
                {/* Tenant Header */}
                <button
                  onClick={() => toggleTenant(tenant.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Server className="h-5 w-5 text-gray-400" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                        {tenant.sector && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {SECTOR_LABELS[tenant.sector]}
                          </span>
                        )}
                        {!tenant.sector && (
                          <Link
                            to={`/tenants/${tenant.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            Configurer le secteur
                          </Link>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{tenant.contactEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasConfig ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Bot className="h-3 w-3" />
                        {configState?.config?.enabled ? 'IA activée' : 'IA désactivée'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Non configuré
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Config Form */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
                    {/* Success/Error Messages */}
                    {saveSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800">{saveSuccess}</p>
                        <button
                          onClick={() => setSaveSuccess('')}
                          className="ml-auto text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {saveError && (
                      <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-danger-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-danger-800">{saveError}</p>
                      </div>
                    )}

                    {/* Existing config info */}
                    {hasConfig && configState?.config && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Fournisseur</span>
                            <p className="font-medium text-gray-900">
                              {PROVIDER_LABELS[configState.config.provider]}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Clé API</span>
                            <p className="font-medium text-gray-900 font-mono">
                              {configState.config.maskedApiKey}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Fréquence</span>
                            <p className="font-medium text-gray-900">
                              {FREQUENCY_LABELS[configState.config.generationFrequency]}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Dernière génération</span>
                            <p className="font-medium text-gray-900">
                              {configState.config.lastGeneratedAt
                                ? new Date(configState.config.lastGeneratedAt).toLocaleDateString('fr-FR')
                                : 'Jamais'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form */}
                    <div className="space-y-4">
                      {/* Provider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fournisseur IA
                        </label>
                        <select
                          value={formProvider}
                          onChange={(e) => setFormProvider(e.target.value as AiProvider)}
                          className="input"
                        >
                          {Object.values(AiProvider).map((p) => (
                            <option key={p} value={p}>
                              {PROVIDER_LABELS[p]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* API Key */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Key className="h-4 w-4 inline mr-1" />
                          Clé API {hasConfig && '(laisser vide pour conserver la clé actuelle)'}
                        </label>
                        <input
                          type="password"
                          value={formApiKey}
                          onChange={(e) => setFormApiKey(e.target.value)}
                          className="input"
                          placeholder={hasConfig ? '••••••••••••••••' : 'sk-...'}
                          required={!hasConfig}
                        />
                      </div>

                      {/* Enabled Toggle */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Activer la génération IA
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormEnabled(!formEnabled)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            formEnabled ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              formEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fréquence de génération
                        </label>
                        <select
                          value={formFrequency}
                          onChange={(e) => setFormFrequency(e.target.value as GenerationFrequency)}
                          className="input"
                        >
                          {Object.values(GenerationFrequency).map((f) => (
                            <option key={f} value={f}>
                              {FREQUENCY_LABELS[f]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Test Result */}
                      {testResult && (
                        <div
                          className={`p-3 rounded-lg border flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-green-50 border-green-200'
                              : 'bg-danger-50 border-danger-200'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-danger-600" />
                          )}
                          <p
                            className={`text-sm ${
                              testResult.success ? 'text-green-800' : 'text-danger-800'
                            }`}
                          >
                            {testResult.message}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => handleSave(tenant.id)}
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {saving ? 'Sauvegarde...' : hasConfig ? 'Mettre à jour' : 'Créer'}
                        </button>

                        {hasConfig && (
                          <>
                            <button
                              onClick={() => handleTest(tenant.id)}
                              disabled={testing}
                              className="btn-secondary"
                            >
                              {testing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <FlaskConical className="h-4 w-4 mr-2" />
                              )}
                              {testing ? 'Test...' : 'Tester la clé'}
                            </button>

                            <button
                              onClick={() => handleDelete(tenant.id)}
                              disabled={deleting}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-danger-700 bg-danger-50 rounded-lg hover:bg-danger-100 transition-colors disabled:opacity-50"
                            >
                              {deleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
