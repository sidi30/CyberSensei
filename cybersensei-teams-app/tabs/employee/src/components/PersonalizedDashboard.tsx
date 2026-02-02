import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, PersonalizedGreeting, Recommendations } from '../hooks/useApi';
import {
  Flame,
  Star,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function PersonalizedDashboard() {
  const { backendToken, user } = useAuth();
  const { apiClient } = useApi(backendToken);
  const [greeting, setGreeting] = useState<PersonalizedGreeting | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiClient) {
      loadPersonalizationData();
    }
  }, [apiClient]);

  const loadPersonalizationData = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const [greetingData, recsData] = await Promise.all([
        apiClient.getPersonalizedGreeting(),
        apiClient.getRecommendations(),
      ]);
      setGreeting(greetingData);
      setRecommendations(recsData);
    } catch (err) {
      console.error('Error loading personalization data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const userName = user?.displayName?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="space-y-4">
      {/* Greeting Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {greeting?.emoji} {greeting?.timeGreeting}, {userName} !
            </h1>
            {greeting?.streakMessage && (
              <div className="flex items-center space-x-2 text-primary-100">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="font-medium">{greeting.streakMessage}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Award className="w-6 h-6 text-yellow-300" />
              <span className="text-xl font-bold">Niveau {greeting?.currentLevel || 1}</span>
            </div>
            <div className="text-sm text-primary-100">
              {greeting?.totalXP || 0} XP total
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        {greeting && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-primary-100 mb-1">
              <span>Progression niveau {greeting.currentLevel}</span>
              <span>{greeting.xpInCurrentLevel} / {greeting.xpForNextLevel} XP</span>
            </div>
            <div className="bg-primary-400 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${greeting.levelProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Goal & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Goal */}
        <div className={`card ${recommendations?.dailyGoalReached ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Objectif du jour</span>
            {recommendations?.dailyGoalReached ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Target className="w-5 h-5 text-primary-600" />
            )}
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-gray-900">
              {recommendations?.exercisesToday || 0}
            </span>
            <span className="text-lg text-gray-600">
              / {recommendations?.dailyGoal || 1}
            </span>
          </div>
          {recommendations?.dailyGoalReached ? (
            <p className="text-sm text-green-700 mt-2">
              Objectif atteint ! Bravo !
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Plus que {(recommendations?.dailyGoal || 1) - (recommendations?.exercisesToday || 0)} exercice(s)
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Serie en cours</span>
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-orange-900">
              {greeting?.streakDays || 0}
            </span>
            <span className="text-lg text-orange-700">jour(s)</span>
          </div>
          <p className="text-sm text-orange-700 mt-2">
            {greeting?.streakDays && greeting.streakDays > 0
              ? "Continue comme ca !"
              : "Fais un exercice pour demarrer !"}
          </p>
        </div>

        {/* XP Today */}
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">XP Total</span>
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-purple-900">
              {greeting?.totalXP || 0}
            </span>
            <span className="text-lg text-purple-700">XP</span>
          </div>
          <p className="text-sm text-purple-700 mt-2">
            Niveau {greeting?.currentLevel || 1} atteint
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Recommandations pour toi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Topics to Improve */}
            {recommendations.topicsToImprove.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Sujets a ameliorer</span>
                </div>
                <ul className="space-y-1">
                  {recommendations.topicsToImprove.slice(0, 3).map((topic) => (
                    <li key={topic} className="text-sm text-yellow-700 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Topics to Explore */}
            {recommendations.newTopicsToExplore.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Nouveaux sujets a decouvrir</span>
                </div>
                <ul className="space-y-1">
                  {recommendations.newTopicsToExplore.slice(0, 3).map((topic) => (
                    <li key={topic} className="text-sm text-blue-700 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Difficulty */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 md:col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Niveau suggere</span>
              </div>
              <p className="text-sm text-green-700">
                Basé sur tes performances, nous te recommandons le niveau{' '}
                <span className="font-bold">
                  {translateDifficulty(recommendations.suggestedDifficulty)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function translateDifficulty(difficulty: string): string {
  const translations: Record<string, string> = {
    'BEGINNER': 'Debutant',
    'INTERMEDIATE': 'Intermediaire',
    'ADVANCED': 'Avance',
    'EXPERT': 'Expert',
  };
  return translations[difficulty] || difficulty;
}
