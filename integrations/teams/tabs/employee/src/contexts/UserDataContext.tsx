import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApi } from '../hooks/useApi';
import type { User } from '../types';

interface UserStatus {
  lastQuizDone?: {
    title: string;
    score: number;
    maxScore: number;
    date: string;
  };
  globalScore: number;
  totalExercises: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface UserDataContextType {
  backendUser: User | null;
  userStatus: UserStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { backendToken } = useAuth();
  const { apiClient } = useApi(backendToken);
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (backendToken && apiClient) {
      loadUserData();
    }
  }, [backendToken, apiClient]);

  const loadUserData = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);

      // Charger les données utilisateur du backend
      const userData = await apiClient.getCurrentUser();
      setBackendUser(userData);

      // Charger l'historique pour calculer le status
      const history = await apiClient.getHistory();
      
      // Calculer le status
      const totalScore = history.reduce((sum, item) => sum + item.score, 0);
      const totalMax = history.reduce((sum, item) => sum + item.maxScore, 0);
      const globalScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      const lastQuiz = history.length > 0 ? history[0] : undefined;

      setUserStatus({
        lastQuizDone: lastQuiz ? {
          title: lastQuiz.title,
          score: lastQuiz.score,
          maxScore: lastQuiz.maxScore,
          date: lastQuiz.completedAt,
        } : undefined,
        globalScore,
        totalExercises: history.length,
        riskLevel: globalScore >= 80 ? 'LOW' : globalScore >= 60 ? 'MEDIUM' : 'HIGH',
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Erreur lors du chargement des donnees. Verifiez que le backend est demarre.');
      setUserStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDataContext.Provider value={{ backendUser, userStatus, loading, error, refetch: loadUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

