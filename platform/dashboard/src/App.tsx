import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantsListPage from './pages/TenantsListPage';
import TenantDetailsPage from './pages/TenantDetailsPage';
import UpdatesPage from './pages/UpdatesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ExercisesPage from './pages/ExercisesPage';
import AiConfigPage from './pages/AiConfigPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import InfraScanPage from './pages/InfraScanPage';
import DlpPage from './pages/DlpPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
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
            <Route path="infra-scan" element={<InfraScanPage />} />
            <Route path="dlp" element={<DlpPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="admins" element={<AdminUsersPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="ai-config" element={<AiConfigPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
