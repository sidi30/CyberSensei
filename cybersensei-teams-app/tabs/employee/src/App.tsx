import { useAuth } from './contexts/AuthContext';
import { useUserData } from './contexts/UserDataContext';
import { Header } from './components/Header';
import { StatusSection } from './components/StatusSection';
import { TodayExerciseSection } from './components/TodayExerciseSection';
import { AskCyberSenseiSection } from './components/AskCyberSenseiSection';
import { Loader2 } from 'lucide-react';

function App() {
  const { loading: authLoading, error: authError } = useAuth();
  const { loading: dataLoading, error: dataError } = useUserData();

  const loading = authLoading || dataLoading;
  const error = authError || dataError;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatusSection />
        <TodayExerciseSection />
        <AskCyberSenseiSection />
      </main>
    </div>
  );
}

export default App;
