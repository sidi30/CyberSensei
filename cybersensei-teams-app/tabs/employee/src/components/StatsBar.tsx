import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi, PersonalizedGreeting } from '../hooks/useApi';
import { Flame, Star, Award, ChevronDown, ChevronUp, Target } from 'lucide-react';

export function StatsBar() {
  const { backendToken } = useAuth();
  const { apiClient } = useApi(backendToken);
  const [greeting, setGreeting] = useState<PersonalizedGreeting | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiClient) {
      loadGreeting();
    }
  }, [apiClient]);

  const loadGreeting = async () => {
    if (!apiClient) return;
    try {
      const data = await apiClient.getPersonalizedGreeting();
      setGreeting(data);
    } catch (err) {
      console.error('Error loading greeting:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !greeting) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      {/* Compact Stats Row */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          {/* Level */}
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Niv. {greeting.currentLevel}</span>
          </div>

          {/* XP */}
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm">{greeting.totalXP} XP</span>
          </div>

          {/* Streak */}
          {greeting.streakDays > 0 && (
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm">{greeting.streakDays}j</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Level Progress Mini */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-20 bg-white/20 rounded-full h-1.5">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${greeting.levelProgress}%` }}
              />
            </div>
            <span className="text-xs text-indigo-200">{greeting.levelProgress}%</span>
          </div>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-indigo-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-indigo-200" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-white/10 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-3 gap-3">
            {/* Level Card */}
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Award className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
              <div className="text-lg font-bold">{greeting.currentLevel}</div>
              <div className="text-xs text-indigo-200">Niveau</div>
            </div>

            {/* XP Card */}
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Star className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
              <div className="text-lg font-bold">{greeting.totalXP}</div>
              <div className="text-xs text-indigo-200">XP Total</div>
            </div>

            {/* Streak Card */}
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold">{greeting.streakDays}</div>
              <div className="text-xs text-indigo-200">Jours serie</div>
            </div>
          </div>

          {/* Level Progress Full */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>Progression vers niveau {greeting.currentLevel + 1}</span>
              <span>{greeting.xpInCurrentLevel}/{greeting.xpForNextLevel} XP</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${greeting.levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
