import React, { useEffect, useState } from 'react';

// Types
interface ModuleProgress {
  moduleId: number;
  moduleName: string;
  displayName: string;
  description: string;
  difficulty: string;
  totalExercises: number;
  exercisesCompleted: number;
  exercisesSuccess: number;
  completionPercentage: number;
  averageScore: number;
  status: string;
  iconUrl?: string;
  startedAt?: string;
  completedAt?: string;
  badgeEarned: boolean;
  badgeName?: string;
}

interface Badge {
  badgeId: number;
  name: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  badgeType: string;
  rarity: string;
  points: number;
  earnedAt?: string;
  earned: boolean;
}

interface UserDashboard {
  userId: number;
  name: string;
  email: string;
  currentLevel: number;
  totalXp: number;
  xpToNextLevel: number;
  rank: string;
  modulesCompleted: number;
  totalModules: number;
  totalBadges: number;
  streakDays: number;
  lastActivityDate?: string;
  modulesProgress: ModuleProgress[];
  badgesEarned: Badge[];
  suggestedNextModule?: ModuleProgress;
  overallCompletionPercentage: number;
  averageScore: number;
  totalExercisesCompleted: number;
}

interface Props {
  userId: number;
}

const UserProgressDashboard: React.FC<Props> = ({ userId }) => {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, [userId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/progression/dashboard/${userId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du dashboard');
      }
      
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">❌ Erreur</h3>
          <p className="text-red-600">{error || 'Impossible de charger les données'}</p>
          <button 
            onClick={fetchDashboard}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'DÉBUTANT': return 'text-green-600 bg-green-100';
      case 'INTERMÉDIAIRE': return 'text-blue-600 bg-blue-100';
      case 'AVANCÉ': return 'text-purple-600 bg-purple-100';
      case 'EXPERT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'border-gray-400 bg-gray-50';
      case 'RARE': return 'border-blue-400 bg-blue-50';
      case 'EPIC': return 'border-purple-400 bg-purple-50';
      case 'LEGENDARY': return 'border-orange-400 bg-orange-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const xpProgress = (dashboard.totalXp / dashboard.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{dashboard.name}</h1>
              <p className="text-gray-600">{dashboard.email}</p>
            </div>
            <div className={`px-6 py-3 rounded-full font-bold text-lg ${getRankColor(dashboard.rank)}`}>
              {dashboard.rank}
            </div>
          </div>

          {/* Niveau et XP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <div className="text-sm opacity-90">Niveau</div>
              <div className="text-4xl font-bold">{dashboard.currentLevel}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <div className="text-sm opacity-90">Total XP</div>
              <div className="text-4xl font-bold">{dashboard.totalXp}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="text-sm opacity-90">Modules</div>
              <div className="text-4xl font-bold">{dashboard.modulesCompleted}/{dashboard.totalModules}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
              <div className="text-sm opacity-90">Badges</div>
              <div className="text-4xl font-bold">{dashboard.totalBadges}</div>
            </div>
          </div>

          {/* Barre de progression XP */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Progression vers le niveau {dashboard.currentLevel + 1}</span>
              <span className="text-gray-600">{dashboard.totalXp} / {dashboard.xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dashboard.streakDays}</div>
              <div className="text-sm text-gray-600">🔥 Jours de suite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dashboard.totalExercisesCompleted}</div>
              <div className="text-sm text-gray-600">📝 Exercices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dashboard.averageScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">📊 Score moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dashboard.overallCompletionPercentage.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">✅ Complétion</div>
            </div>
          </div>
        </div>

        {/* Module Suggéré */}
        {dashboard.suggestedNextModule && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">🎯 Module Suggéré</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{dashboard.suggestedNextModule.displayName}</h3>
                <p className="opacity-90">{dashboard.suggestedNextModule.description}</p>
                <div className="mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {dashboard.suggestedNextModule.exercisesCompleted}/{dashboard.suggestedNextModule.totalExercises} exercices
                  </span>
                </div>
              </div>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                Continuer →
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Modules de Formation</h2>
              <div className="space-y-4">
                {dashboard.modulesProgress.map((module) => (
                  <div 
                    key={module.moduleId} 
                    className={`border rounded-lg p-4 transition hover:shadow-md ${
                      module.status === 'COMPLETED' ? 'bg-green-50 border-green-300' : 
                      module.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-300' : 
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-800">{module.displayName}</h3>
                          {module.badgeEarned && (
                            <span className="text-yellow-500" title={module.badgeName}>🏆</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`${getDifficultyColor(module.difficulty)} text-white text-xs px-2 py-1 rounded`}>
                            {module.difficulty}
                          </span>
                          <span className="text-sm text-gray-600">
                            {module.exercisesCompleted}/{module.totalExercises} exercices
                          </span>
                          {module.averageScore > 0 && (
                            <span className="text-sm text-gray-600">
                              • {module.averageScore.toFixed(0)}% de réussite
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{module.completionPercentage.toFixed(0)}%</div>
                        <div className="text-xs text-gray-600">{module.status}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          module.status === 'COMPLETED' ? 'bg-green-500' : 
                          module.status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                          'bg-gray-400'
                        }`}
                        style={{ width: `${module.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Badges Obtenus</h2>
              {dashboard.badgesEarned.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Complétez des modules pour gagner des badges !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.badgesEarned.map((badge) => (
                    <div 
                      key={badge.badgeId} 
                      className={`border-2 rounded-lg p-4 ${getRarityColor(badge.rarity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">🏆</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{badge.displayName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-semibold text-gray-700">
                              {badge.rarity} • {badge.points} XP
                            </span>
                            {badge.earnedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(badge.earnedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProgressDashboard;

