import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { DailyExercise } from './components/DailyExercise';
import { Loader2, Shield } from 'lucide-react';

function App() {
  const { loading: authLoading, error: authError } = useAuth();
  const [started, setStarted] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CyberSensei
            </h1>
            <p className="text-gray-600">Formation en Cybersécurité</p>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                👋 Bienvenue !
              </h2>
              <p className="text-gray-700 mb-4">
                Ton exercice quotidien t'attend. C'est rapide et c'est maintenant !
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">⏱️</span>
                  <span>Durée : 5 minutes</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📚</span>
                  <span>3-5 questions</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎯</span>
                  <span>Tu dois compléter l'exercice</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Important :</strong> Les exercices sont personnalisés et obligatoires. Pas de choix = pas de mauvaise foi !
              </p>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Commencer l'exercice du jour
          </button>
        </div>
      </div>
    );
  }

  return <DailyExercise />;
}

export default App;
