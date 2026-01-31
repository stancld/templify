import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const TemplateEditor = lazy(() => import('./components/editor/TemplateEditor').then(m => ({ default: m.TemplateEditor })));
const DataEntryScreen = lazy(() => import('./components/data-entry/DataEntryScreen').then(m => ({ default: m.DataEntryScreen })));
const ReviewScreen = lazy(() => import('./components/review/ReviewScreen').then(m => ({ default: m.ReviewScreen })));
const AuthPage = lazy(() => import('./components/auth/AuthPage').then(m => ({ default: m.AuthPage })));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor/:templateId"
                element={
                  <ProtectedRoute>
                    <TemplateEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data/:templateId"
                element={
                  <ProtectedRoute>
                    <DataEntryScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review/:templateId"
                element={
                  <ProtectedRoute>
                    <ReviewScreen />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
