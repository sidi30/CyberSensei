import { useAuth } from './contexts/AuthContext';
import { DailyExercise } from './components/DailyExercise';
import { Loader2, ShieldCheck } from 'lucide-react';

/**
 * CyberSensei - Application 100% Conversationnelle
 * 
 * L'employé voit UNIQUEMENT une interface de chat.
 * Le bot initie la conversation automatiquement.
 * Aucun bouton "Commencer", aucun menu, aucun dashboard.
 */
function App() {
  const { loading: authLoading, error: authError } = useAuth();

  // Écran de chargement minimaliste
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        </div>
        <p className="text-indigo-200 mt-6 text-lg font-medium animate-pulse">
          CyberSensei arrive...
        </p>
      </div>
    );
  }

  // Écran d'erreur minimaliste
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Connexion impossible
          </h2>
          <p className="text-red-200 mb-6 text-sm">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-colors border border-white/20"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Interface conversationnelle - démarrage automatique
  // Pas d'écran d'accueil, pas de bouton "Commencer"
  // Le bot initie la conversation immédiatement
  return <DailyExercise />;
}

export default App;
