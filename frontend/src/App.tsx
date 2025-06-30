import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Context
import { AuthProvider, useAuth } from "@/features/auth/context/auth.context";

// Theme
import { theme } from "@/shared/styles/theme";

// Layout Components
import { Layout } from "@/shared/components/Layout/Layout";
import { PrivateRoute } from "@/shared/components/PrivateRoute/PrivateRoute";

// Feature Pages - Lazy loaded for better performance
const LoginPage = React.lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = React.lazy(
  () => import("@/features/auth/pages/RegisterPage")
);
const PasswordChangePage = React.lazy(
  () => import("@/features/auth/pages/PasswordChangePage")
);
const PasswordResetRequestPage = React.lazy(
  () => import("@/features/auth/pages/PasswordResetRequestPage")
);
const PasswordResetConfirmPage = React.lazy(
  () => import("@/features/auth/pages/PasswordResetConfirmPage")
);
const EmailVerificationPage = React.lazy(
  () => import("@/features/auth/pages/EmailVerificationPage")
);
const DashboardPage = React.lazy(
  () => import("@/features/dashboard/pages/DashboardPage")
);
const ProjectsPage = React.lazy(
  () => import("@/features/projects/pages/ProjectsPage")
);
const ProjectDetailsPage = React.lazy(
  () => import("@/features/projects/pages/ProjectDetailsPage")
);
const RequirementsPage = React.lazy(
  () => import("@/features/requirements/pages/RequirementsPage")
);
const RequirementDetailsPage = React.lazy(
  () => import("@/features/requirements/pages/RequirementDetailsPage")
);
const TestingPage = React.lazy(
  () => import("@/features/testing/pages/TestingPage")
);
const TestRunDetailsPage = React.lazy(
  () => import("@/features/testing/pages/TestRunDetailsPage")
);
const ReleasesPage = React.lazy(
  () => import("@/features/releases/pages/ReleasesPage")
);
const ReleaseDetailsPage = React.lazy(
  () => import("@/features/releases/pages/ReleaseDetailsPage")
);
const AdminPage = React.lazy(() => import("@/features/admin/pages/AdminPage"));
const ProfilePage = React.lazy(
  () => import("@/features/auth/pages/ProfilePage")
);
const SettingsPage = React.lazy(
  () => import("@/features/settings/pages/SettingsPage")
);
const ReportsPage = React.lazy(
  () => import("@/features/reports/pages/ReportsPage")
);
const ApiOverviewPage = React.lazy(
  () => import("@/features/dashboard/pages/ApiOverviewPage")
);
const StartPage = React.lazy(
  () => import("@/features/dashboard/pages/StartPage")
);
const NotFoundPage = React.lazy(() => import("@/shared/pages/NotFoundPage"));

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/start" replace />
          ) : (
            <React.Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </React.Suspense>
          )
        }
      />

      {/* Auth Routes */}
      <Route
        path="/auth/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <React.Suspense fallback={<LoadingFallback />}>
              <RegisterPage />
            </React.Suspense>
          )
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <React.Suspense fallback={<LoadingFallback />}>
              <PasswordResetRequestPage />
            </React.Suspense>
          )
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <React.Suspense fallback={<LoadingFallback />}>
              <PasswordResetConfirmPage />
            </React.Suspense>
          )
        }
      />
      <Route
        path="/verify-email"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
            <EmailVerificationPage />
          </React.Suspense>
        }
      />

      {/* Start Page - Public Route */}
      <Route
        path="/start"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
            <StartPage />
          </React.Suspense>
        }
      />

      {/* API Overview - Public Route */}
      <Route
        path="/api-overview"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
            <ApiOverviewPage />
          </React.Suspense>
        }
      />

      {/* Root redirect to start */}
      <Route
        path="/"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
            <Navigate to="/start" replace />
          </React.Suspense>
        }
      />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Dashboard */}
        <Route
          path="dashboard"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </React.Suspense>
          }
        />

        {/* Projects */}
        <Route
          path="projects"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectsPage />
            </React.Suspense>
          }
        />
        <Route
          path="projects/:id"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectDetailsPage />
            </React.Suspense>
          }
        />

        {/* Requirements */}
        <Route
          path="requirements"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <RequirementsPage />
            </React.Suspense>
          }
        />
        <Route
          path="requirements/:id"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <RequirementDetailsPage />
            </React.Suspense>
          }
        />

        {/* Testing */}
        <Route
          path="testing"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <TestingPage />
            </React.Suspense>
          }
        />
        <Route
          path="testing/runs/:id"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <TestRunDetailsPage />
            </React.Suspense>
          }
        />

        {/* Releases */}
        <Route
          path="releases"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ReleasesPage />
            </React.Suspense>
          }
        />
        <Route
          path="releases/:id"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ReleaseDetailsPage />
            </React.Suspense>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ReportsPage />
            </React.Suspense>
          }
        />

        {/* Admin */}
        <Route
          path="admin/*"
          element={
            <PrivateRoute requiredPermissions={["admin:read"]}>
              <React.Suspense fallback={<LoadingFallback />}>
                <AdminPage />
              </React.Suspense>
            </PrivateRoute>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </React.Suspense>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </React.Suspense>
          }
        />

        {/* Auth - Password Change (requires authentication) */}
        <Route
          path="auth/change-password"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <PasswordChangePage />
            </React.Suspense>
          }
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </React.Suspense>
        }
      />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
