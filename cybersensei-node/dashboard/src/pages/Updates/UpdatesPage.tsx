import { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Clock, RefreshCw, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  lastCheckDate: string;
  contentVersion: string;
  pendingUpdates: PendingUpdate[];
}

interface PendingUpdate {
  id: string;
  version: string;
  type: 'content' | 'exercises' | 'phishing' | 'system';
  description: string;
  size: string;
  releaseDate: string;
}

interface UpdateHistory {
  id: string;
  version: string;
  appliedAt: string;
  status: 'success' | 'failed';
  details: string;
}

export default function UpdatesPage() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadUpdateInfo();
    loadUpdateHistory();
  }, []);

  const loadUpdateInfo = async () => {
    try {
      const response = await api.get('/api/update/check');
      setUpdateInfo(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading update info:', err);
      setError('Impossible de charger les informations de mise à jour');
      
      // Mock data for development
      setUpdateInfo({
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        updateAvailable: true,
        lastCheckDate: new Date().toISOString(),
        contentVersion: 'content-2024-12-20',
        pendingUpdates: [
          {
            id: 'update-1',
            version: '1.1.0',
            type: 'content',
            description: 'Nouveaux exercices de phishing et contenus de formation',
            size: '25 MB',
            releaseDate: '2024-12-20'
          }
        ]
      });
    }
  };

  const loadUpdateHistory = async () => {
    try {
      const response = await api.get('/api/update/history');
      setUpdateHistory(response.data);
    } catch (err) {
      console.error('Error loading update history:', err);
      
      // Mock data
      setUpdateHistory([
        {
          id: 'hist-1',
          version: '1.0.0',
          appliedAt: '2024-12-15T10:00:00Z',
          status: 'success',
          details: 'Installation initiale'
        }
      ]);
    }
  };

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await api.get('/api/update/check?force=true');
      setUpdateInfo(response.data);
      
      if (!response.data.updateAvailable) {
        alert('Aucune mise à jour disponible. Vous utilisez la dernière version.');
      }
    } catch (err: any) {
      setError('Erreur lors de la vérification des mises à jour');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyUpdate = async (updateId: string) => {
    if (!confirm('Voulez-vous vraiment appliquer cette mise à jour ? L\'opération peut prendre quelques minutes.')) {
      return;
    }

    setIsApplying(true);
    setSelectedUpdate(updateId);
    setError(null);

    try {
      await api.post('/api/update/apply', { updateId });
      
      alert('Mise à jour appliquée avec succès !');
      
      // Reload data
      await loadUpdateInfo();
      await loadUpdateHistory();
    } catch (err: any) {
      setError('Erreur lors de l\'application de la mise à jour');
    } finally {
      setIsApplying(false);
      setSelectedUpdate(null);
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Contenu';
      case 'exercises':
        return 'Exercices';
      case 'phishing':
        return 'Phishing';
      case 'system':
        return 'Système';
      default:
        return type;
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'content':
        return 'bg-blue-100 text-blue-800';
      case 'exercises':
        return 'bg-green-100 text-green-800';
      case 'phishing':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mises à jour</h1>
          <p className="text-gray-600 mt-1">Gestion des mises à jour du système et du contenu</p>
        </div>
        
        <button
          onClick={handleCheckUpdates}
          disabled={isChecking}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Vérification...' : 'Vérifier les mises à jour'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Current Version Info */}
      {updateInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Version système</p>
                <p className="text-2xl font-bold text-gray-900">{updateInfo.currentVersion}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Version contenu</p>
                <p className="text-lg font-semibold text-gray-900">{updateInfo.contentVersion}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dernière vérification</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(updateInfo.lastCheckDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {updateInfo?.updateAvailable && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">
                Mises à jour disponibles ({updateInfo.pendingUpdates.length})
              </p>
              <p className="text-green-600 text-sm mt-1">
                Nouvelle version {updateInfo.latestVersion} disponible
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Updates */}
      {updateInfo && updateInfo.pendingUpdates.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mises à jour en attente
          </h2>

          <div className="space-y-4">
            {updateInfo.pendingUpdates.map((update) => (
              <div
                key={update.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Version {update.version}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUpdateTypeColor(update.type)}`}>
                        {getUpdateTypeLabel(update.type)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{update.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{update.size}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(update.releaseDate), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyUpdate(update.id)}
                    disabled={isApplying}
                    className={`btn-primary ${
                      isApplying && selectedUpdate === update.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isApplying && selectedUpdate === update.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Application...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Appliquer
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Updates */}
      {updateInfo && !updateInfo.updateAvailable && (
        <div className="card text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Système à jour
          </h3>
          <p className="text-gray-600">
            Vous utilisez la dernière version disponible
          </p>
        </div>
      )}

      {/* Update History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historique des mises à jour
        </h2>

        {updateHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Aucune mise à jour appliquée
          </p>
        ) : (
          <div className="space-y-3">
            {updateHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 rounded-full ${
                  history.status === 'success'
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}>
                  {history.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      Version {history.version}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      history.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {history.status === 'success' ? 'Succès' : 'Échec'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">{history.details}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(history.appliedAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Update Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Configuration des mises à jour automatiques
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Mises à jour automatiques</p>
              <p className="text-sm text-gray-600">
                Télécharger et installer automatiquement les mises à jour de contenu
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Vérification quotidienne</p>
              <p className="text-sm text-gray-600">
                Vérifier automatiquement les mises à jour chaque nuit à 3h00
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="label">URL du serveur central</label>
            <input
              type="url"
              className="input"
              placeholder="https://central.cybersensei.io"
              defaultValue="https://central.cybersensei.io"
            />
            <p className="text-sm text-gray-600 mt-1">
              URL du serveur de mises à jour CyberSensei Central
            </p>
          </div>

          <button className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sauvegarder la configuration
          </button>
        </div>
      </div>
    </div>
  );
}

