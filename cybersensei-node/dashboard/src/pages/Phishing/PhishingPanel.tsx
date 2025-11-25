import { useState } from 'react';
import { Send, Mail, TrendingUp } from 'lucide-react';

export default function PhishingPanel() {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes Phishing</h1>
          <p className="text-gray-600 mt-1">Gérer les campagnes de simulation de phishing</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Send className="w-5 h-5" />
          Nouvelle campagne
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'border-primary-600 text-primary-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Campagnes Actives
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Historique
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-primary-600 text-primary-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Emails Envoyés</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de Clic</p>
              <p className="text-2xl font-bold text-gray-900">12.3%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de Signalement</p>
              <p className="text-2xl font-bold text-gray-900">45.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="card">
        {activeTab === 'campaigns' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campagnes Actives</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Campagne #{i}</p>
                      <p className="text-sm text-gray-600">Template Placeholder</p>
                    </div>
                    <span className="text-sm text-gray-600">{Math.floor(Math.random() * 100)}% envoyé</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Campagnes</h3>
            <p className="text-gray-600">Liste des campagnes passées...</p>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
            <p className="text-gray-600">Gérer les templates d'emails de phishing...</p>
          </div>
        )}
      </div>
    </div>
  );
}


