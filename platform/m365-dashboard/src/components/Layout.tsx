import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  History,
  FileText,
  Settings,
  Shield,
} from 'lucide-react';

const navItems = [
  { to: '/overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { to: '/findings', label: 'Problemes', icon: AlertTriangle },
  { to: '/history', label: 'Historique', icon: History },
  { to: '/reports', label: 'Rapports', icon: FileText },
  { to: '/settings', label: 'Parametres', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyber-400" />
          <div>
            <h1 className="text-lg font-bold">Cyber Sensei</h1>
            <p className="text-xs text-gray-400">M365 Security</p>
          </div>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-cyber-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-gray-500 border-t border-gray-800">
          Cyber Sensei v1.0 MVP
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
