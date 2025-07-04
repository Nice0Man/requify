import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth.context";

import { Layout } from "@/shared/ui/Layout/Layout";
import { PrivateRoute } from "@/shared/ui/PrivateRoute/PrivateRoute";

// Feature Pages - Lazy loaded for better performance
const LoginPage = React.lazy(() => import("@/pages/auth/ui/LoginPage"));
const RegisterPage = React.lazy(() => import("@/pages/auth/ui/RegisterPage"));
const PasswordChangePage = React.lazy(
  () => import("@/pages/auth/ui/PasswordChangePage")
);
const PasswordResetRequestPage = React.lazy(
  () => import("@/pages/auth/ui/PasswordResetRequestPage")
);
const PasswordResetConfirmPage = React.lazy(
  () => import("@/pages/auth/ui/PasswordResetConfirmPage")
);
const EmailVerificationPage = React.lazy(
  () => import("@/pages/auth/ui/EmailVerificationPage")
);
const DashboardPage = React.lazy(
  () => import("@/pages/dashboard/ui/DashboardPage")
);
const ProjectsPage = React.lazy(
  () => import("@/pages/projects/ui/ProjectsPage")
);
const ProjectCreatePage = React.lazy(
  () => import("@/pages/projects/ui/ProjectCreatePage")
);
const ProjectDetailsPage = React.lazy(
  () => import("@/pages/projects/ui/ProjectDetailsPage")
);
const ProjectEditPage = React.lazy(
  () => import("@/pages/projects/ui/ProjectEditPage")
);
const RequirementsPage = React.lazy(
  () => import("@/pages/requirements/ui/RequirementsPage")
);
const RequirementCreatePage = React.lazy(
  () => import("@/pages/requirements/ui/RequirementCreatePage")
);
const RequirementDetailsPage = React.lazy(
  () => import("@/pages/requirements/ui/RequirementDetailsPage")
);
const TestingPage = React.lazy(() => import("@/pages/testing/ui/TestingPage"));
const TestPlanCreatePage = React.lazy(
  () => import("@/pages/testing/ui/TestPlanCreatePage")
);
const TestCaseCreatePage = React.lazy(
  () => import("@/pages/testing/ui/TestCaseCreatePage")
);
const ReleasesPage = React.lazy(
  () => import("@/pages/releases/ui/ReleasesPage")
);
const ReleaseCreatePage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseCreatePage")
);
const ReleaseDetailsPage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseDetailsPage")
);
const ReleaseEditPage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseEditPage")
);
const AdminPage = React.lazy(() => import("@/pages/admin/ui/AdminPage"));
const ProfilePage = React.lazy(() => import("@/pages/auth/ui/ProfilePage"));
const SettingsPage = React.lazy(
  () => import("@/pages/settings/ui/SettingsPage")
);
const ReportsPage = React.lazy(() => import("@/pages/reports/ui/ReportsPage"));
const ApiOverviewPage = React.lazy(
  () => import("@/pages/dashboard/ui/ApiOverviewPage")
);
const StartPage = React.lazy(() => import("@/pages/dashboard/ui/StartPage"));
const KanbanPage = React.lazy(() => import("@/pages/kanban/ui/KanbanPage"));
const NotFoundPage = React.lazy(
  () => import("@/pages/not-found/ui/NotFoundPage")
);

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/start" replace /> : <LoginPage />
          }
        />

        {/* Auth Routes */}
        <Route
          path="/auth/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PasswordResetRequestPage />
            )
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PasswordResetConfirmPage />
            )
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        {/* Start Page - Public Route */}
        <Route path="/start" element={<StartPage />} />

        {/* API Overview - Public Route */}
        <Route path="/api-overview" element={<ApiOverviewPage />} />

        {/* Root redirect to start */}
        <Route path="/" element={<Navigate to="/start" replace />} />

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
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Kanban Board */}
          <Route path="kanban" element={<KanbanPage />} />

          {/* Projects */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/create" element={<ProjectCreatePage />} />
          <Route path="projects/:id/edit" element={<ProjectEditPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />

          {/* Requirements */}
          <Route path="requirements" element={<RequirementsPage />} />
          <Route
            path="requirements/create"
            element={<RequirementCreatePage />}
          />
          <Route
            path="requirements/:id/edit"
            element={<RequirementCreatePage />}
          />
          <Route path="requirements/:id" element={<RequirementDetailsPage />} />

          {/* Activity page */}
          <Route path="activity" element={<RequirementsPage />} />

          {/* Notifications */}
          <Route path="notifications" element={<DashboardPage />} />

          {/* Project sub-routes */}
          <Route
            path="projects/:id/requirements"
            element={<RequirementsPage />}
          />
          <Route path="projects/:id/releases" element={<ReleasesPage />} />
          <Route path="projects/:id/settings" element={<ProjectEditPage />} />

          {/* Testing Routes */}
          <Route path="testing" element={<TestingPage />} />
          <Route path="testing/plans/create" element={<TestPlanCreatePage />} />
          <Route path="testing/cases/create" element={<TestCaseCreatePage />} />
          <Route path="testing/reports" element={<ReportsPage />} />
          <Route path="testing/execute" element={<TestingPage />} />

          {/* Team */}
          <Route path="team" element={<DashboardPage />} />

          {/* Activity History */}
          <Route path="history" element={<DashboardPage />} />

          {/* Releases */}
          <Route path="releases" element={<ReleasesPage />} />
          <Route path="releases/create" element={<ReleaseCreatePage />} />
          <Route path="releases/:id" element={<ReleaseDetailsPage />} />
          <Route path="releases/:id/edit" element={<ReleaseEditPage />} />

          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Admin */}
          <Route
            path="admin/*"
            element={
              <PrivateRoute requiredPermissions={["admin:read"]}>
                <AdminPage />
              </PrivateRoute>
            }
          />

          {/* Profile/Auth Routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/settings" element={<ProfilePage />} />
          <Route path="profile/password" element={<PasswordChangePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Auth - Password Change (requires authentication) */}
          <Route path="auth/change-password" element={<PasswordChangePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
