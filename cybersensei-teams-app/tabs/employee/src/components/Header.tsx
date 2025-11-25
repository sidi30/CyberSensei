import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export function Header() {
  const { user, userPhoto } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={user?.displayName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-primary-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-500">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Bonjour, {user?.displayName || 'Utilisateur'} 👋
              </h1>
              <p className="text-sm text-gray-600">
                {user?.jobTitle && user?.department 
                  ? `${user.jobTitle} - ${user.department}`
                  : user?.mail || 'Bienvenue sur CyberSensei'}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-lg">
              <span className="text-2xl">🛡️</span>
              <span className="text-sm font-medium text-primary-700">
                CyberSensei Formation
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

