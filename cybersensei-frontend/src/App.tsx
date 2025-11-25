import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import EmployeeTab from './components/EmployeeTab';
import ManagerTab from './components/ManagerTab';
import LoadingSpinner from './components/LoadingSpinner';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'employee' | 'manager'>('employee');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Chargement de CyberSensei..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ CyberSensei</h1>
            <p className="text-gray-600">Plateforme de formation en cybersécurité</p>
          </div>
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Veuillez vous authentifier via Microsoft Teams ou le backend.
            </p>
            <button
              onClick={() => {
                // In production, implement actual login
                window.location.href = '/login';
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isManager = user.role === UserRole.MANAGER || user.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-bold text-gray-900">CyberSensei</h1>
            </div>

            {/* Tab Navigation */}
            {isManager && (
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('employee')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'employee'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mon espace
                </button>
                <button
                  onClick={() => setActiveTab('manager')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'manager'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tableau de bord
                </button>
              </nav>
            )}

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        {activeTab === 'employee' ? <EmployeeTab /> : isManager && <ManagerTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 CyberSensei - Plateforme de formation en cybersécurité
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;


