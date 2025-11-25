import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerAPI } from '../../services/api';
import type { UserMetrics } from '../../types';
import { ArrowLeft, Mail, Award, TrendingUp } from 'lucide-react';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUserDetails(parseInt(id));
    }
  }, [id]);

  const loadUserDetails = async (userId: number) => {
    try {
      const data = await managerAPI.getUserDetails(userId);
      setUserMetrics(data);
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!userMetrics) {
    return <div className="text-center text-gray-600">Utilisateur non trouvé</div>;
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-success-100 text-success-800';
      case 'MEDIUM': return 'bg-warning-100 text-warning-800';
      case 'HIGH': return 'bg-danger-100 text-danger-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/users')} className="btn-secondary flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </button>

      {/* User Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {userMetrics.userName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userMetrics.userName}</h1>
              <p className="text-gray-600">{userMetrics.department}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(userMetrics.riskLevel)}`}>
            {userMetrics.riskLevel}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Award className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gray-900">{userMetrics.score}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exercices Complétés</p>
              <p className="text-2xl font-bold text-gray-900">{userMetrics.exercisesCompleted}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Mail className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Phishing Tests</p>
              <p className="text-lg font-bold text-gray-900">
                {userMetrics.phishingTestsPassed} / {userMetrics.phishingTestsPassed + userMetrics.phishingTestsFailed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Points Faibles</h3>
        {userMetrics.weaknesses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userMetrics.weaknesses.map((weakness, index) => (
              <span key={index} className="px-3 py-1 bg-danger-50 text-danger-700 rounded-full text-sm">
                {weakness}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Aucun point faible identifié</p>
        )}
      </div>

      {/* Charts placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart placeholder - Progression over time</p>
        </div>
      </div>
    </div>
  );
}


