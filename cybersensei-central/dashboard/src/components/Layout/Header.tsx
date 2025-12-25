import { Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../lib/utils';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 lg:ml-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

