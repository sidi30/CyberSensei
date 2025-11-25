import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('smtp');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configuration du système</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {['smtp', 'frequency', 'sync', 'license'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'smtp' && 'SMTP'}
            {tab === 'frequency' && 'Fréquence'}
            {tab === 'sync' && 'Synchronisation'}
            {tab === 'license' && 'Licence'}
          </button>
        ))}
      </div>

      {/* SMTP Settings */}
      {activeTab === 'smtp' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Configuration SMTP</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Host</label>
              <input type="text" className="input" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="label">Port</label>
              <input type="number" className="input" placeholder="587" />
            </div>
            <div>
              <label className="label">Username</label>
              <input type="text" className="input" placeholder="noreply@company.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">From Email</label>
              <input type="email" className="input" placeholder="noreply@company.com" />
            </div>
            <div>
              <label className="label">From Name</label>
              <input type="text" className="input" placeholder="CyberSensei" />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button className="btn-secondary">Tester la connexion</button>
          </div>
        </div>
      )}

      {/* Frequency Settings */}
      {activeTab === 'frequency' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Fréquence des Campagnes</h3>
          
          <div>
            <label className="label">Fréquence de phishing (par semaine)</label>
            <input type="range" min="1" max="7" defaultValue="2" className="w-full" />
            <p className="text-sm text-gray-600 mt-2">2 campagnes par semaine</p>
          </div>

          <div>
            <label className="label">Intensité de formation</label>
            <select className="input">
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Élevée</option>
            </select>
          </div>

          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      )}

      {/* Sync Settings */}
      {activeTab === 'sync' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Synchronisation & Mises à jour</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Dernière vérification</p>
                <p className="text-sm text-gray-600">Il y a 2 heures</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Vérifier
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Version actuelle</p>
                <p className="text-sm text-gray-600">1.0.0</p>
              </div>
              <span className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm font-medium">
                À jour
              </span>
            </div>
          </div>
        </div>
      )}

      {/* License Settings */}
      {activeTab === 'license' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Informations de Licence</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Type de licence</p>
                <p className="text-sm text-gray-600">PREMIUM</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tenant ID</p>
                <p className="font-medium text-gray-900">demo-company-123</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Expiration</p>
                <p className="font-medium text-gray-900">31/12/2024</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilisateurs max</p>
                <p className="font-medium text-gray-900">100</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Support</p>
                <p className="font-medium text-gray-900">24/7</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


