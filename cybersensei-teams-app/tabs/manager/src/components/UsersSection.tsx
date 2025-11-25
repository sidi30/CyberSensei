import { useState, useEffect } from 'react';
import type { ApiClient } from '../hooks/useApi';
import type { ManagerUser } from '../types';
import { Search, Filter, ChevronRight, Loader2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserDetailsDrawer } from './UserDetailsDrawer';

interface UsersSectionProps {
  apiClient: ApiClient;
}

export function UsersSection({ apiClient }: UsersSectionProps) {
  const [users, setUsers] = useState<ManagerUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ManagerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<ManagerUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, departmentFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getManagerUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      
      // Mock data
      if (import.meta.env.DEV) {
        setUsers([
          {
            id: '1',
            displayName: 'Jean Martin',
            email: 'jean.martin@company.com',
            department: 'IT',
            score: 85,
            completedExercises: 12,
            lastActivity: new Date().toISOString(),
            riskLevel: 'LOW',
          },
          {
            id: '2',
            displayName: 'Sophie Dubois',
            email: 'sophie.dubois@company.com',
            department: 'Marketing',
            score: 65,
            completedExercises: 8,
            lastActivity: new Date(Date.now() - 86400000).toISOString(),
            riskLevel: 'MEDIUM',
          },
          {
            id: '3',
            displayName: 'Pierre Lefebvre',
            email: 'pierre.lefebvre@company.com',
            department: 'Finance',
            score: 45,
            completedExercises: 3,
            lastActivity: new Date(Date.now() - 604800000).toISOString(),
            riskLevel: 'HIGH',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.displayName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.department?.toLowerCase().includes(term)
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((user) => user.department === departmentFilter);
    }

    setFilteredUsers(filtered);
  };

  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));

  const getRiskBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Faible
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Moyen
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Élevé
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const handleUserClick = async (user: ManagerUser) => {
    try {
      // Charger les détails complets
      const fullDetails = await apiClient.getUserDetails(user.id);
      setSelectedUser(fullDetails);
      setDrawerOpen(true);
    } catch (err) {
      console.error('Error loading user details:', err);
      // Fallback avec les données existantes
      setSelectedUser(user);
      setDrawerOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Utilisateurs ({filteredUsers.length})
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="sm:w-48 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input pl-10 appearance-none"
            >
              <option value="">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Nom
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Département
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Score
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Risque
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Exercices
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {user.department || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-lg ${getScoreColor(user.score)}`}>
                      {user.score}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getRiskBadge(user.riskLevel)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {user.completedExercises}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </div>

      {/* User Details Drawer */}
      {selectedUser && (
        <UserDetailsDrawer
          user={selectedUser}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}

