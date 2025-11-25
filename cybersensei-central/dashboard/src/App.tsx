import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
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
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
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

