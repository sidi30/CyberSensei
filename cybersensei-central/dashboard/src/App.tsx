import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import TenantsListPage from './pages/TenantsListPage';
import TenantDetailsPage from './pages/TenantDetailsPage';
import UpdatesPage from './pages/UpdatesPage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Toutes les routes sans authentification */}
          <Route
            path="/"
            element={<DashboardLayout />}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tenants" element={<TenantsListPage />} />
            <Route path="tenants/:id" element={<TenantDetailsPage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="admins" element={<AdminUsersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

