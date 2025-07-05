import React, { Suspense, startTransition } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/features/auth/model/auth.context";

import { Layout } from "@/shared/ui/Layout";
import { PrivateRoute } from "@/shared/ui/PrivateRoute";

// Feature Pages - Lazy loaded for better performance
const AuthPage = React.lazy(() => import("@/pages/auth/ui/AuthPage"));
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

// Enhanced Loading component with modern design
const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 40%, ${theme.palette.primary.main}08 0%, transparent 50%), 
                        radial-gradient(circle at 70% 70%, ${theme.palette.secondary.main}08 0%, transparent 50%)`,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            p: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Animated Logo/Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: 700,
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "scale(1.05)",
                    opacity: 0.8,
                  },
                },
              }}
            >
              R
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Requify
            </Typography>
          </Box>

          {/* Enhanced Spinner */}
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
                animation: "spin 1.5s linear infinite",
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
            <CircularProgress
              size={60}
              thickness={4}
              variant="determinate"
              value={25}
              sx={{
                color: theme.palette.secondary.main,
                position: "absolute",
                left: 0,
                animation: "spinReverse 2s linear infinite",
                "@keyframes spinReverse": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(-360deg)",
                  },
                },
              }}
            />
          </Box>

          {/* Loading Message */}
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textAlign: "center",
              animation: "fadeInOut 2s ease-in-out infinite",
              "@keyframes fadeInOut": {
                "0%, 100%": {
                  opacity: 0.7,
                },
                "50%": {
                  opacity: 1,
                },
              },
            }}
          >
            {message}
          </Typography>

          {/* Loading Dots */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              "& > div": {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.primary.main,
                animation: "bounce 1.4s ease-in-out infinite both",
                "&:nth-of-type(1)": { animationDelay: "-0.32s" },
                "&:nth-of-type(2)": { animationDelay: "-0.16s" },
              },
              "@keyframes bounce": {
                "0%, 80%, 100%": {
                  transform: "scale(0)",
                },
                "40%": {
                  transform: "scale(1)",
                },
              },
            }}
          >
            <div />
            <div />
            <div />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

// Page-specific loading components
const PageLoadingFallback: React.FC<{ pageName?: string }> = ({ 
  pageName = "page" 
}) => (
  <LoadingFallback message={`Loading ${pageName}...`} />
);

const AuthLoadingFallback: React.FC = () => (
  <LoadingFallback message="Preparing authentication..." />
);

const DashboardLoadingFallback: React.FC = () => (
  <LoadingFallback message="Loading dashboard..." />
);

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback message="Initializing application..." />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<AuthLoadingFallback />}>
                <AuthPage />
              </Suspense>
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/start" replace />
            ) : (
              <Suspense fallback={<AuthLoadingFallback />}>
                <LoginPage />
              </Suspense>
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
              <Suspense fallback={<AuthLoadingFallback />}>
                <RegisterPage />
              </Suspense>
            )
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<PageLoadingFallback pageName="password reset" />}>
                <PasswordResetRequestPage />
              </Suspense>
            )
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<PageLoadingFallback pageName="password reset" />}>
                <PasswordResetConfirmPage />
              </Suspense>
            )
          }
        />
        <Route 
          path="/verify-email" 
          element={
            <Suspense fallback={<PageLoadingFallback pageName="email verification" />}>
              <EmailVerificationPage />
            </Suspense>
          } 
        />

        {/* Start Page - Public Route */}
        <Route 
          path="/start" 
          element={
            <Suspense fallback={<PageLoadingFallback pageName="start page" />}>
              <StartPage />
            </Suspense>
          } 
        />

        {/* API Overview - Public Route */}
        <Route 
          path="/api-overview" 
          element={
            <Suspense fallback={<PageLoadingFallback pageName="API overview" />}>
              <ApiOverviewPage />
            </Suspense>
          } 
        />

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
          <Route 
            path="dashboard" 
            element={
              <Suspense fallback={<DashboardLoadingFallback />}>
                <DashboardPage />
              </Suspense>
            } 
          />

          {/* Kanban Board */}
          <Route 
            path="kanban" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="kanban board" />}>
                <KanbanPage />
              </Suspense>
            } 
          />

          {/* Projects */}
          <Route 
            path="projects" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="projects" />}>
                <ProjectsPage />
              </Suspense>
            } 
          />
          <Route 
            path="projects/create" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project creation" />}>
                <ProjectCreatePage />
              </Suspense>
            } 
          />
          <Route 
            path="projects/:id/edit" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project editor" />}>
                <ProjectEditPage />
              </Suspense>
            } 
          />
          <Route 
            path="projects/:id" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project details" />}>
                <ProjectDetailsPage />
              </Suspense>
            } 
          />

          {/* Requirements */}
          <Route 
            path="requirements" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="requirements" />}>
                <RequirementsPage />
              </Suspense>
            } 
          />
          <Route
            path="requirements/create"
            element={
              <Suspense fallback={<PageLoadingFallback pageName="requirement creation" />}>
                <RequirementCreatePage />
              </Suspense>
            }
          />
          <Route
            path="requirements/:id/edit"
            element={
              <Suspense fallback={<PageLoadingFallback pageName="requirement editor" />}>
                <RequirementCreatePage />
              </Suspense>
            }
          />
          <Route 
            path="requirements/:id" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="requirement details" />}>
                <RequirementDetailsPage />
              </Suspense>
            } 
          />

          {/* Activity page */}
          <Route 
            path="activity" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="activity" />}>
                <RequirementsPage />
              </Suspense>
            } 
          />

          {/* Notifications */}
          <Route 
            path="notifications" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="notifications" />}>
                <DashboardPage />
              </Suspense>
            } 
          />

          {/* Project sub-routes */}
          <Route
            path="projects/:id/requirements"
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project requirements" />}>
                <RequirementsPage />
              </Suspense>
            }
          />
          <Route 
            path="projects/:id/releases" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project releases" />}>
                <ReleasesPage />
              </Suspense>
            } 
          />
          <Route 
            path="projects/:id/settings" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="project settings" />}>
                <ProjectEditPage />
              </Suspense>
            } 
          />

          {/* Testing Routes */}
          <Route 
            path="testing" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="testing" />}>
                <TestingPage />
              </Suspense>
            } 
          />
          <Route 
            path="testing/plans/create" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="test plan creation" />}>
                <TestPlanCreatePage />
              </Suspense>
            } 
          />
          <Route 
            path="testing/cases/create" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="test case creation" />}>
                <TestCaseCreatePage />
              </Suspense>
            } 
          />
          <Route 
            path="testing/reports" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="test reports" />}>
                <ReportsPage />
              </Suspense>
            } 
          />
          <Route 
            path="testing/execute" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="test execution" />}>
                <TestingPage />
              </Suspense>
            } 
          />

          {/* Team */}
          <Route 
            path="team" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="team" />}>
                <DashboardPage />
              </Suspense>
            } 
          />

          {/* Activity History */}
          <Route 
            path="history" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="history" />}>
                <DashboardPage />
              </Suspense>
            } 
          />

          {/* Releases */}
          <Route 
            path="releases" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="releases" />}>
                <ReleasesPage />
              </Suspense>
            } 
          />
          <Route 
            path="releases/create" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="release creation" />}>
                <ReleaseCreatePage />
              </Suspense>
            } 
          />
          <Route 
            path="releases/:id" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="release details" />}>
                <ReleaseDetailsPage />
              </Suspense>
            } 
          />
          <Route 
            path="releases/:id/edit" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="release editor" />}>
                <ReleaseEditPage />
              </Suspense>
            } 
          />

          {/* Reports */}
          <Route 
            path="reports" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="reports" />}>
                <ReportsPage />
              </Suspense>
            } 
          />

          {/* Admin */}
          <Route
            path="admin/*"
            element={
              <PrivateRoute requiredPermissions={["admin:read"]}>
                <Suspense fallback={<PageLoadingFallback pageName="admin panel" />}>
                  <AdminPage />
                </Suspense>
              </PrivateRoute>
            }
          />

          {/* Profile/Auth Routes */}
          <Route 
            path="profile" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="profile" />}>
                <ProfilePage />
              </Suspense>
            } 
          />
          <Route 
            path="profile/settings" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="profile settings" />}>
                <ProfilePage />
              </Suspense>
            } 
          />
          <Route 
            path="profile/password" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="password change" />}>
                <PasswordChangePage />
              </Suspense>
            } 
          />
          <Route 
            path="settings" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="settings" />}>
                <SettingsPage />
              </Suspense>
            } 
          />

          {/* Auth - Password Change (requires authentication) */}
          <Route 
            path="auth/change-password" 
            element={
              <Suspense fallback={<PageLoadingFallback pageName="password change" />}>
                <PasswordChangePage />
              </Suspense>
            } 
          />
        </Route>

        {/* 404 */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<PageLoadingFallback pageName="page" />}>
              <NotFoundPage />
            </Suspense>
          } 
        />
      </Routes>
    </Suspense>
  );
};
