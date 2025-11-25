import { useUserData } from '../contexts/UserDataContext';
import { Trophy, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

export function StatusSection() {
  const { userStatus } = useUserData();

  if (!userStatus) return null;

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level?: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'MEDIUM':
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Votre statut CyberSensei
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getRiskLevelColor(userStatus.riskLevel)}`}>
          {getRiskLevelIcon(userStatus.riskLevel)}
          <span>
            {userStatus.riskLevel === 'LOW' && 'Niveau de risque faible'}
            {userStatus.riskLevel === 'MEDIUM' && 'Niveau de risque moyen'}
            {userStatus.riskLevel === 'HIGH' && 'Niveau de risque élevé'}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Global */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-700">
              Score Global
            </span>
            <Trophy className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-primary-900">
              {userStatus.globalScore}
            </span>
            <span className="text-lg text-primary-700">%</span>
          </div>
          <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${userStatus.globalScore}%` }}
            />
          </div>
        </div>

        {/* Exercices Complétés */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">
              Exercices Complétés
            </span>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-green-900">
              {userStatus.totalExercises}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Continuez comme ça ! 🎯
          </p>
        </div>

        {/* Dernier Quiz */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">
              Dernier Quiz
            </span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          {userStatus.lastQuizDone ? (
            <>
              <div className="flex items-baseline space-x-1 mb-1">
                <span className="text-2xl font-bold text-purple-900">
                  {userStatus.lastQuizDone.score}
                </span>
                <span className="text-sm text-purple-700">
                  / {userStatus.lastQuizDone.maxScore}
                </span>
              </div>
              <p className="text-xs text-purple-700 line-clamp-1">
                {userStatus.lastQuizDone.title}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {new Date(userStatus.lastQuizDone.date).toLocaleDateString('fr-FR')}
              </p>
            </>
          ) : (
            <p className="text-sm text-purple-700">
              Aucun quiz complété
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

