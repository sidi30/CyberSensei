import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import apiService from '../services/api';
import { CompanyMetrics, RiskLevel, UserMetrics, CompanySettings } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ManagerTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserMetrics | null>(null);
  const [showUserDrawer, setShowUserDrawer] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<CompanySettings>({
    phishingFrequency: 1,
    trainingIntensity: 'medium',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Mock user data (in production, fetch from backend)
  const [users] = useState<UserMetrics[]>([
    {
      userId: 1,
      name: 'Alice Martin',
      department: 'IT',
      score: 85,
      riskLevel: RiskLevel.LOW,
      lastQuizDate: '2024-01-15',
      completedExercises: 12,
      phishingClickRate: 5,
      topicBreakdown: [
        { topic: 'Phishing', score: 90, exercises: 4 },
        { topic: 'Passwords', score: 85, exercises: 3 },
        { topic: 'Social Engineering', score: 80, exercises: 5 },
      ],
      recommendedActions: [
        'Continuer les exercices avancés',
        'Réviser la sécurité des mots de passe',
      ],
    },
    {
      userId: 2,
      name: 'Bob Dupont',
      department: 'Marketing',
      score: 45,
      riskLevel: RiskLevel.HIGH,
      lastQuizDate: '2024-01-10',
      completedExercises: 3,
      phishingClickRate: 60,
      topicBreakdown: [
        { topic: 'Phishing', score: 40, exercises: 2 },
        { topic: 'Passwords', score: 50, exercises: 1 },
      ],
      recommendedActions: [
        'Formation urgente sur le phishing',
        'Exercices de reconnaissance des emails suspects',
        'Renforcer la sensibilisation aux risques',
      ],
    },
    {
      userId: 3,
      name: 'Claire Lefebvre',
      department: 'Finance',
      score: 72,
      riskLevel: RiskLevel.MEDIUM,
      lastQuizDate: '2024-01-14',
      completedExercises: 8,
      phishingClickRate: 20,
      topicBreakdown: [
        { topic: 'Phishing', score: 75, exercises: 3 },
        { topic: 'Passwords', score: 70, exercises: 2 },
        { topic: 'Data Protection', score: 70, exercises: 3 },
      ],
      recommendedActions: ['Renforcer les exercices intermédiaires', 'Focus sur le phishing'],
    },
  ]);

  useEffect(() => {
    loadMetrics();
    loadSettings();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCompanyMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load metrics:', err);
      setError(err.response?.data?.message || 'Impossible de charger les métriques');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Use default settings
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await apiService.saveSettings(settings);
      alert('Paramètres sauvegardés avec succès !');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert('Échec de la sauvegarde des paramètres');
    } finally {
      setSavingSettings(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-success-100 text-success-800';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL:
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'Faible';
      case RiskLevel.MEDIUM:
        return 'Moyen';
      case RiskLevel.HIGH:
        return 'Élevé';
      case RiskLevel.CRITICAL:
        return 'Critique';
      default:
        return level;
    }
  };

  // Mock chart data (in production, fetch historical data)
  const chartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Score de sécurité',
        data: [65, 70, 75, metrics?.score || 78],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Taux de clics phishing',
        data: [35, 28, 22, metrics?.phishingClickRate || 18],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const participationRate = metrics
    ? Math.round((metrics.completedExercises / (metrics.activeUsers * 10)) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Score de l'entreprise</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : `${metrics?.score || 0}%`}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                  metrics?.riskLevel || RiskLevel.MEDIUM
                )}`}
              >
                Risque {getRiskLevelLabel(metrics?.riskLevel || RiskLevel.MEDIUM)}
              </span>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Taux de participation</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : `${participationRate}%`}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {metrics?.completedExercises || 0} exercices complétés
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Dernière mise à jour</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading
                  ? '...'
                  : metrics?.updatedAt
                  ? new Date(metrics.updatedAt).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </p>
              <p className="text-xs text-success-600 mt-2">✅ Système opérationnel</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Chargement des données..." />}
      {error && <ErrorMessage message={error} onRetry={loadMetrics} />}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Utilisateurs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau de risque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: 100 }}>
                        <div
                          className={`h-2 rounded-full ${
                            user.score >= 70 ? 'bg-success-500' : user.score >= 50 ? 'bg-yellow-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${user.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(
                        user.riskLevel
                      )}`}
                    >
                      {getRiskLevelLabel(user.riskLevel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDrawer(true);
                      }}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      Voir détails →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendances entreprise</h2>
        <div style={{ height: 300 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres</h2>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence des emails de phishing (par semaine)
            </label>
            <input
              type="number"
              min="0"
              max="7"
              value={settings.phishingFrequency}
              onChange={(e) =>
                setSettings({ ...settings, phishingFrequency: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensité de formation
            </label>
            <select
              value={settings.trainingIntensity}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trainingIntensity: e.target.value as 'low' | 'medium' | 'high',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Faible (1 exercice/semaine)</option>
              <option value="medium">Moyenne (3 exercices/semaine)</option>
              <option value="high">Élevée (5 exercices/semaine)</option>
            </select>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {savingSettings ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </div>

      {/* User Details Drawer */}
      {showUserDrawer && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full md:w-[500px] h-full overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Détails utilisateur</h2>
                <button
                  onClick={() => setShowUserDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.department}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(
                      selectedUser.riskLevel
                    )}`}
                  >
                    {getRiskLevelLabel(selectedUser.riskLevel)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-primary-600 font-medium">Score global</p>
                  <p className="text-2xl font-bold text-primary-900 mt-1">
                    {selectedUser.score}%
                  </p>
                </div>
                <div className="bg-success-50 rounded-lg p-4">
                  <p className="text-sm text-success-600 font-medium">Exercices</p>
                  <p className="text-2xl font-bold text-success-900 mt-1">
                    {selectedUser.completedExercises}
                  </p>
                </div>
              </div>

              {/* Topic Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Répartition par sujet
                </h3>
                <div className="space-y-3">
                  {selectedUser.topicBreakdown?.map((topic, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{topic.topic}</span>
                        <span className="text-gray-600">
                          {topic.score}% ({topic.exercises} ex.)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${topic.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Phishing Result */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  Dernier résultat phishing
                </h3>
                <p className="text-sm text-yellow-900">
                  Taux de clic : {selectedUser.phishingClickRate}%
                  {selectedUser.phishingClickRate > 30 ? ' ⚠️ Attention requise' : ' ✓ Bon'}
                </p>
              </div>

              {/* Recommended Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Actions recommandées
                </h3>
                <ul className="space-y-2">
                  {selectedUser.recommendedActions?.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTab;


