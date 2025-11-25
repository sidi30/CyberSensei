import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tableau de bord Manager
              </h1>
              <p className="text-sm text-gray-600">
                {user?.displayName || 'Manager'} • {user?.department || 'Management'}
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <span className="text-sm font-medium text-purple-700">
                📊 Vue d'ensemble de la sécurité
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

