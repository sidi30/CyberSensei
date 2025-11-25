import { useState, useEffect } from 'react';
import type { ApiClient } from '../hooks/useApi';
import type { Settings } from '../types';
import { Settings as SettingsIcon, Save, Loader2, CheckCircle } from 'lucide-react';

interface SettingsSectionProps {
  apiClient: ApiClient;
}

export function SettingsSection({ apiClient }: SettingsSectionProps) {
  const [settings, setSettings] = useState<Settings>({
    phishingFrequency: 1,
    trainingIntensity: 'medium',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      
      // Mock data
      if (import.meta.env.DEV) {
        setSettings({
          phishingFrequency: 2,
          trainingIntensity: 'medium',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      await apiClient.saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Paramètres de la plateforme
          </h2>
          <p className="text-sm text-gray-600">
            Configurez la fréquence et l'intensité des formations
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Phishing Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fréquence des tests de phishing
            <span className="text-gray-500 font-normal ml-2">(par semaine)</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={settings.phishingFrequency}
              onChange={(e) =>
                setSettings({ ...settings, phishingFrequency: parseInt(e.target.value) })
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-primary-600">
                {settings.phishingFrequency}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Aucun</span>
            <span>1x</span>
            <span>2x</span>
            <span>3x</span>
            <span>4x</span>
            <span>5x</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {settings.phishingFrequency === 0 && 'Les tests de phishing sont désactivés'}
            {settings.phishingFrequency === 1 && 'Un test de phishing par semaine sera envoyé aléatoirement'}
            {settings.phishingFrequency > 1 && `${settings.phishingFrequency} tests de phishing par semaine seront envoyés aléatoirement`}
          </p>
        </div>

        {/* Training Intensity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Intensité de la formation
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.trainingIntensity === 'low'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="intensity"
                value="low"
                checked={settings.trainingIntensity === 'low'}
                onChange={(e) =>
                  setSettings({ ...settings, trainingIntensity: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="absolute top-4 right-4 w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌱</span>
                <span className="font-semibold text-gray-900">Faible</span>
              </div>
              <p className="text-sm text-gray-600">
                1 exercice par semaine
                <br />
                Recommandé pour débuter
              </p>
            </label>

            <label
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.trainingIntensity === 'medium'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="intensity"
                value="medium"
                checked={settings.trainingIntensity === 'medium'}
                onChange={(e) =>
                  setSettings({ ...settings, trainingIntensity: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="absolute top-4 right-4 w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌿</span>
                <span className="font-semibold text-gray-900">Moyenne</span>
              </div>
              <p className="text-sm text-gray-600">
                2-3 exercices par semaine
                <br />
                Recommandé pour la plupart
              </p>
            </label>

            <label
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.trainingIntensity === 'high'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="intensity"
                value="high"
                checked={settings.trainingIntensity === 'high'}
                onChange={(e) =>
                  setSettings({ ...settings, trainingIntensity: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="absolute top-4 right-4 w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌳</span>
                <span className="font-semibold text-gray-900">Élevée</span>
              </div>
              <p className="text-sm text-gray-600">
                4-5 exercices par semaine
                <br />
                Pour environnements critiques
              </p>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Les modifications prendront effet immédiatement
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

