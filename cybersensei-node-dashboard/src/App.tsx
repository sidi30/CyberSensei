import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';

// Lazy load pages
import { lazy, Suspense } from 'react';

const UsersList = lazy(() => import('./pages/Users/UsersList'));
const UserDetails = lazy(() => import('./pages/Users/UserDetails'));
const ExercisesPanel = lazy(() => import('./pages/Exercises/ExercisesPanel'));
const PhishingPanel = lazy(() => import('./pages/Phishing/PhishingPanel'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            
            <Route
              path="users"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <UsersList />
                </Suspense>
              }
            />
            <Route
              path="users/:id"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <UserDetails />
                </Suspense>
              }
            />
            
            <Route
              path="exercises"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ExercisesPanel />
                </Suspense>
              }
            />
            
            <Route
              path="phishing"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PhishingPanel />
                </Suspense>
              }
            />
            
            <Route
              path="settings"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


