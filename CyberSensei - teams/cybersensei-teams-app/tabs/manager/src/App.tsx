import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useApi } from './hooks/useApi';
import type { User } from './types';
import { Header } from './components/Header';
import { KPISection } from './components/KPISection';
import { UsersSection } from './components/UsersSection';
import { CompanyInsightsSection } from './components/CompanyInsightsSection';
import { SettingsSection } from './components/SettingsSection';
import { Loader2, ShieldAlert } from 'lucide-react';

function App() {
  const { token, loading: authLoading, error: authError } = useAuth();
  const { apiClient } = useApi(token);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && apiClient) {
      loadUserData();
    }
  }, [token, apiClient]);

  const loadUserData = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Erreur lors du chargement des données utilisateur');
      
      // Mock pour développement
      if (import.meta.env.DEV) {
        setUser({
          id: 'dev-manager-123',
          email: 'marie.dupont@company.com',
          displayName: 'Marie Dupont',
          role: 'MANAGER',
          department: 'IT Security',
          jobTitle: 'Responsable Sécurité',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{authError || error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a le rôle MANAGER ou ADMIN
  if (user && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 mb-4">
            Cette section est réservée aux managers et administrateurs.
          </p>
          <p className="text-sm text-gray-500">
            Votre rôle actuel : <span className="font-medium">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <KPISection apiClient={apiClient!} />
        <UsersSection apiClient={apiClient!} />
        <CompanyInsightsSection apiClient={apiClient!} />
        <SettingsSection apiClient={apiClient!} />
      </main>
    </div>
  );
}

export default App;
