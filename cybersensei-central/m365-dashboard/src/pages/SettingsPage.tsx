import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import { getConnectionStatus, getConnectUrl, disconnect } from '../api';
import type { ConnectionStatus } from '../types';

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [tenantId, setTenantId] = useState(localStorage.getItem('m365_tenant_id') || '');
  const [saved, setSaved] = useState(!!tenantId);

  const justConnected = searchParams.get('connected') === 'true';
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (tenantId) loadStatus();
  }, [tenantId]);

  async function loadStatus() {
    try {
      const s = await getConnectionStatus();
      setStatus(s);
    } catch {
      setStatus(null);
    }
  }

  function handleSaveTenant() {
    localStorage.setItem('m365_tenant_id', tenantId);
    setSaved(true);
    loadStatus();
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      loadStatus();
    } catch {
      // Handle error
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parametres</h1>

      {justConnected && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Connexion Microsoft 365 etablie avec succes!
        </div>
      )}

      {oauthError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Erreur OAuth: {oauthError}
        </div>
      )}

      {/* Tenant Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Configuration du tenant</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Entrez votre Tenant ID"
            value={tenantId}
            onChange={(e) => { setTenantId(e.target.value); setSaved(false); }}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyber-400"
          />
          <button
            onClick={handleSaveTenant}
            disabled={!tenantId || saved}
            className="px-4 py-2 bg-cyber-600 text-white rounded-lg text-sm hover:bg-cyber-700 disabled:opacity-50 transition-colors"
          >
            {saved ? 'Sauvegarde' : 'Sauvegarder'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Votre Tenant ID est fourni par l'administrateur Cyber Sensei.
        </p>
      </div>

      {/* M365 Connection */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Connexion Microsoft 365</h3>

        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Connecte</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Domaine:</span>
                <span className="ml-2 font-medium">{status.microsoftTenantDomain || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Connecte par:</span>
                <span className="ml-2">{status.connectedByEmail || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Dernier scan:</span>
                <span className="ml-2">{status.lastScanAt ? new Date(status.lastScanAt).toLocaleString('fr-FR') : 'Jamais'}</span>
              </div>
              <div>
                <span className="text-gray-500">Token:</span>
                <span className={`ml-2 ${status.tokenValid ? 'text-green-600' : 'text-red-600'}`}>
                  {status.tokenValid ? 'Valide' : 'Expire'}
                </span>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              Deconnecter M365
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connectez le tenant Microsoft 365 de votre entreprise pour permettre le scan de securite.
              Un administrateur global devra approuver les permissions (lecture seule).
            </p>
            <a
              href={tenantId ? getConnectUrl() : '#'}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors ${!tenantId ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Link2 className="w-4 h-4" />
              Connecter Microsoft 365
            </a>
            {!tenantId && (
              <p className="text-xs text-red-500">Sauvegardez d'abord votre Tenant ID ci-dessus.</p>
            )}
          </div>
        )}
      </div>

      {/* Permissions Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-3">Permissions demandees</h3>
        <p className="text-sm text-gray-600 mb-3">
          Cyber Sensei demande uniquement des permissions en <strong>lecture seule</strong>.
          Aucune modification n'est apportee a votre tenant.
        </p>
        <ul className="text-xs text-gray-500 space-y-1 grid grid-cols-2 gap-1">
          {[
            'User.Read.All', 'UserAuthenticationMethod.Read.All', 'Directory.Read.All',
            'RoleManagement.Read.Directory', 'Mail.Read', 'MailboxSettings.Read',
            'Sites.Read.All', 'Application.Read.All', 'Policy.Read.All',
            'AuditLog.Read.All', 'SecurityEvents.Read.All', 'Domain.Read.All',
            'Organization.Read.All', 'Reports.Read.All',
          ].map((p) => (
            <li key={p} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
