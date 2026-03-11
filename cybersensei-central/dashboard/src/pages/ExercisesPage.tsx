import { useEffect, useState } from 'react';
import {
  Search,
  BookOpen,
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Exercise, ExerciseStats, Tenant } from '../types';

const TOPICS = [
  'Phishing',
  'Securite des mots de passe',
  'Ingenierie sociale',
  'Ransomware',
  'Securite email',
  'Navigation web securisee',
  'Protection des donnees sensibles',
  'Authentification MFA',
  'Securite mobile',
  'Securite reseau',
];

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-orange-100 text-orange-800',
  EXPERT: 'bg-red-100 text-red-800',
};

type FilterMode = 'all' | 'ai' | 'manual';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [exerciseCount, setExerciseCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [exercisesData, statsData] = await Promise.all([
        api.getExercises(),
        api.getExerciseStats(),
      ]);
      setExercises(exercisesData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des exercices');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setGenerateError('');
    setTenantsLoading(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
      if (data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement tenants:', err);
    } finally {
      setTenantsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTopics([]);
    setSelectedDifficulty('');
    setExerciseCount(5);
    setGenerateError('');
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setGenerateError('Veuillez sélectionner un tenant');
      return;
    }

    setGenerating(true);
    setGenerateError('');

    try {
      const result = await api.generateExercises({
        tenantId: selectedTenantId,
        topics: selectedTopics.length > 0 ? selectedTopics : undefined,
        difficulty: selectedDifficulty || undefined,
        count: exerciseCount,
      });

      setSuccessMessage(`${result.generated} exercice(s) généré(s) avec succès !`);
      closeModal();
      await loadData();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setGenerateError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'ai' && exercise.generatedByAi) ||
      (filterMode === 'manual' && !exercise.generatedByAi);
    return matchesSearch && matchesFilter;
  });

  const aiCount = exercises.filter((e) => e.generatedByAi).length;

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
        <button onClick={loadData} className="btn-primary">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
          <p className="text-gray-600 mt-1">Gérez et générez des exercices de cybersécurité</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Sparkles className="h-4 w-4 mr-2" />
          Générer des exercices
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total exercices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Générés par IA</p>
                <p className="text-2xl font-bold text-gray-900">{aiCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterMode('ai')}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filterMode === 'ai'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              IA
            </button>
            <button
              onClick={() => setFilterMode('manual')}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filterMode === 'manual'
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manuel
            </button>
          </div>
        </div>
      </div>

      {/* Exercises Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulté
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exercise.topic}</div>
                    {exercise.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {exercise.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exercise.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        DIFFICULTY_COLORS[exercise.difficulty] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exercise.generatedByAi ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Bot className="h-3 w-3" />
                        IA
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Manuel
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {exercise.active ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <XCircle className="h-4 w-4" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exercise.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(exercise.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun exercice trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterMode !== 'all'
                ? 'Aucun exercice ne correspond à vos filtres'
                : 'Commencez par générer des exercices avec l\'IA'}
            </p>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Générer des exercices</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {generateError && (
              <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-800">{generateError}</p>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Tenant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant
                </label>
                {tenantsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des tenants...
                  </div>
                ) : (
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Sélectionner un tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujets (optionnel)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map((topic) => (
                    <label
                      key={topic}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedTopics.includes(topic)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic)}
                        onChange={() => toggleTopic(topic)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté (optionnel)
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="input"
                >
                  <option value="">Toutes les difficultés</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'exercices
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={exerciseCount}
                  onChange={(e) => setExerciseCount(parseInt(e.target.value) || 1)}
                  className="input"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary"
                  disabled={generating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={generating || !selectedTenantId}
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Générer
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
