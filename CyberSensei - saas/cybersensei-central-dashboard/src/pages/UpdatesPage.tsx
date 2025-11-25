import { useEffect, useState } from 'react';
import { Upload, Package, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { UpdateMetadata } from '../types';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdateMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const data = await api.getUpdates();
      setUpdates(data);
    } catch (err) {
      console.error('Erreur chargement mises à jour:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setUploadError('Seuls les fichiers ZIP sont acceptés');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      await api.uploadUpdate(file);
      setUploadSuccess(true);
      await loadUpdates();
      // Reset file input
      event.target.value = '';
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mises à Jour</h1>
        <p className="text-gray-600 mt-1">Gérez les mises à jour déployées aux clients</p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nouvelle Mise à Jour
        </h3>

        {uploadSuccess && (
          <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success-800">Mise à jour uploadée avec succès !</p>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger-800">{uploadError}</p>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="btn-primary">
              {uploading ? 'Upload en cours...' : 'Sélectionner un fichier ZIP'}
            </span>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".zip"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Le fichier ZIP doit contenir un fichier version.json avec les métadonnées
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Format version.json :</p>
          <pre className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  "version": "1.0.1",
  "changelog": "Fixed bugs...",
  "requiredNodeVersion": "1.0.0"
}`}
          </pre>
        </div>
      </div>

      {/* Updates List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historique des Versions
        </h3>

        {updates.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune mise à jour</h3>
            <p className="mt-1 text-sm text-gray-500">
              Uploadez votre première mise à jour pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                  <Package className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Version {update.version}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{update.changelog}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span>
                      Requiert: v{update.requiredNodeVersion}+
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button className="btn-secondary btn-sm">
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

