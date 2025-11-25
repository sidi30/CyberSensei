import { useEffect } from 'react';
import type { ManagerUser } from '../types';
import { X, Mail, Building, Target, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

interface UserDetailsDrawerProps {
  user: ManagerUser;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsDrawer({ user, open, onClose }: UserDetailsDrawerProps) {
  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Détails utilisateur</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.displayName}
                </h3>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  {user.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {user.department}
                    </div>
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${getRiskColor(user.riskLevel)}`}>
                Risque {user.riskLevel === 'LOW' ? 'Faible' : user.riskLevel === 'MEDIUM' ? 'Moyen' : 'Élevé'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Score Global</span>
                  <Target className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{user.score}%</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Exercices</span>
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{user.completedExercises}</div>
              </div>
            </div>
          </div>

          {/* Topic-based Breakdown */}
          {user.topicScores && user.topicScores.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Performance par sujet</h4>
              <div className="space-y-3">
                {user.topicScores.map((topic) => (
                  <div key={topic.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                      <span className={`text-sm font-semibold ${
                        topic.score >= 80 ? 'text-green-600' :
                        topic.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {topic.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          topic.score >= 80 ? 'bg-green-500' :
                          topic.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Phishing Result */}
          {user.lastPhishingResult && (
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Dernier test de phishing</h4>
              <div className={`p-4 rounded-lg border-2 ${
                user.lastPhishingResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.lastPhishingResult.testName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(user.lastPhishingResult.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className={`text-2xl ${
                    user.lastPhishingResult.success ? '✅' : '❌'
                  }`} />
                </div>
                <div className={`text-sm ${
                  user.lastPhishingResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {user.lastPhishingResult.success
                    ? 'Tentative détectée et signalée correctement'
                    : 'Tombé dans le piège - Formation recommandée'}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {user.recommendedActions && (
            <div className="card bg-amber-50 border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Actions recommandées
                  </h4>
                  <p className="text-sm text-amber-800 whitespace-pre-wrap">
                    {user.recommendedActions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Activity */}
          {user.lastActivity && (
            <div className="card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dernière activité</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.lastActivity).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

