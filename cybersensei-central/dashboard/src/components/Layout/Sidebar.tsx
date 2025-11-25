import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Upload,
  Users,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'SUPPORT'] },
  { name: 'Tenants', href: '/tenants', icon: Server, roles: ['SUPERADMIN', 'SUPPORT'] },
  { name: 'Mises à jour', href: '/updates', icon: Upload, roles: ['SUPERADMIN'] },
  { name: 'Administrateurs', href: '/admins', icon: Users, roles: ['SUPERADMIN'] },
];

export function Sidebar() {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <Shield className="h-8 w-8 text-primary-600" />
          <span className="ml-3 text-xl font-bold text-gray-900">
            CyberSensei
          </span>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-3 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

