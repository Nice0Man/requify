import React, { Suspense, useEffect, useTransition } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { completeNavigation } from "@/app/store/slices/routerSlice";
import {
  selectIsAuthenticated,
  selectIsLoading as selectAuthLoading,
} from "@/features/auth/model/authSlice";
import { selectIsNavigating } from "@/app/store/slices/routerSlice";
import { PageLoadingSpinner } from "@/shared/ui/LoadingSpinner";

import { Layout } from "@/shared/ui/Layout";
import { PrivateRoute } from "@/shared/ui/PrivateRoute";

// Pages - Lazy loaded for better performance
const AuthPage = React.lazy(() => import("@/pages/auth/ui/AuthPage"));
const DashboardPage = React.lazy(() => import("@/pages/dashboard/ui/DashboardPage"));
const ProjectsPage = React.lazy(() => import("@/pages/projects/ui/ProjectsPage"));
const RequirementsPage = React.lazy(() => import("@/pages/requirements/ui/RequirementsPage"));
const TestingPage = React.lazy(() => import("@/pages/testing/ui/TestingPage"));
const ReleasesPage = React.lazy(() => import("@/pages/releases/ui/ReleasesPage"));
const AdminPage = React.lazy(() => import("@/pages/admin/ui/AdminPage"));
const SettingsPage = React.lazy(() => import("@/pages/settings/ui/SettingsPage"));
const ReportsPage = React.lazy(() => import("@/pages/reports/ui/ReportsPage"));
const NotFoundPage = React.lazy(() => import("@/pages/not-found/ui/NotFoundPage"));

// Lazy load sub-pages
const HomePage = React.lazy(() => import("@/pages/dashboard/ui/HomePage"));
const StartPage = React.lazy(() => import("@/pages/dashboard/ui/StartPage"));
const ApiOverviewPage = React.lazy(
  () => import("@/pages/dashboard/ui/ApiOverviewPage")
);
const KanbanPage = React.lazy(() => import("@/pages/kanban/ui/KanbanPage"));

// Auth sub-pages
const LoginPage = React.lazy(() => import("@/pages/auth/ui/LoginPage"));
const RegisterPage = React.lazy(() => import("@/pages/auth/ui/RegisterPage"));
const PasswordResetRequestPage = React.lazy(
  () => import("@/pages/auth/ui/PasswordResetRequestPage")
);
const PasswordResetConfirmPage = React.lazy(
  () => import("@/pages/auth/ui/PasswordResetConfirmPage")
);
const EmailVerificationPage = React.lazy(
  () => import("@/pages/auth/ui/EmailVerificationPage")
);
const ChangePasswordPage = React.lazy(
  () => import("@/pages/auth/ui/PasswordChangePage")
);

// Project sub-pages
const ProjectCreatePage = React.lazy(
  () => import("@/pages/projects/ui/ProjectCreatePage")
);
const ProjectDetailsPage = React.lazy(
  () => import("@/pages/projects/ui/ProjectDetailsPage")
);
const ProjectEditPage = React.lazy(
  () => import("@/pages/projects/ui/ProjectEditPage")
);

// Requirement sub-pages
const RequirementCreatePage = React.lazy(
  () => import("@/pages/requirements/ui/RequirementCreatePage")
);
const RequirementDetailsPage = React.lazy(
  () => import("@/pages/requirements/ui/RequirementDetailsPage")
);

// Testing sub-pages
const TestPlanCreatePage = React.lazy(
  () => import("@/pages/testing/ui/TestPlanCreatePage")
);
const TestCaseCreatePage = React.lazy(
  () => import("@/pages/testing/ui/TestCaseCreatePage")
);

// Release sub-pages
const ReleaseCreatePage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseCreatePage")
);
const ReleaseDetailsPage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseDetailsPage")
);
const ReleaseEditPage = React.lazy(
  () => import("@/pages/releases/ui/ReleaseEditPage")
);

// Enhanced loading components with Redux integration
const PageLoadingFallback: React.FC<{ pageName?: string }> = ({
  pageName = "page",
}) => {
  const isNavigating = useAppSelector(selectIsNavigating);
  return (
    <PageLoadingSpinner
      message={
        isNavigating ? `Navigating to ${pageName}...` : `Loading ${pageName}...`
      }
    />
  );
};

const AuthLoadingFallback: React.FC = () => {
  const isNavigating = useAppSelector(selectIsNavigating);
  return (
    <PageLoadingSpinner
      message={
        isNavigating
          ? "Navigating to authentication..."
          : "Preparing authentication..."
      }
    />
  );
};

const DashboardLoadingFallback: React.FC = () => {
  const isNavigating = useAppSelector(selectIsNavigating);
  return (
    <PageLoadingSpinner
      message={
        isNavigating ? "Navigating to dashboard..." : "Loading dashboard..."
      }
    />
  );
};

// Component for handling route transitions with Redux
const RouteTransitionHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Обновляем Redux состояние при изменении роута
    startTransition(() => {
      dispatch(
        completeNavigation({
          route: location.pathname,
          params: {},
          queryParams: Object.fromEntries(new URLSearchParams(location.search)),
          replace: navigationType === "REPLACE",
        })
      );
    });
  }, [location, navigationType, dispatch]);

  return <>{children}</>;
};

export const AppRouterWithRedux: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);
  const isNavigating = useAppSelector(selectIsNavigating);

  if (authLoading) {
    return <PageLoadingSpinner message="Initializing application..." />;
  }

  return (
    <RouteTransitionHandler>
      <Suspense fallback={<PageLoadingSpinner />}>
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
                <Navigate to="/dashboard" replace />
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
                <Suspense
                  fallback={<PageLoadingFallback pageName="password reset" />}
                >
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
                <Suspense
                  fallback={<PageLoadingFallback pageName="password reset" />}
                >
                  <PasswordResetConfirmPage />
                </Suspense>
              )
            }
          />
          <Route
            path="/auth/change-password"
            element={
              <PrivateRoute>
                <Suspense
                  fallback={<PageLoadingFallback pageName="change password" />}
                >
                  <ChangePasswordPage />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <Suspense
                fallback={<PageLoadingFallback pageName="email verification" />}
              >
                <EmailVerificationPage />
              </Suspense>
            }
          />

          {/* Root homepage - Start Page with landing */}
          <Route
            path="/"
            element={
              <Suspense
                fallback={<PageLoadingFallback pageName="landing page" />}
              >
                <StartPage />
              </Suspense>
            }
          />

          {/* Start Page - Simple Homepage */}
          <Route
            path="/start"
            element={
              <Suspense fallback={<PageLoadingFallback pageName="homepage" />}>
                <HomePage />
              </Suspense>
            }
          />

          {/* API Overview - Public Route */}
          <Route
            path="/api-overview"
            element={
              <Suspense
                fallback={<PageLoadingFallback pageName="API overview" />}
              >
                <ApiOverviewPage />
              </Suspense>
            }
          />

          {/* Private Routes with Layout */}
          <Route
            path="/*"
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
                <Suspense
                  fallback={<PageLoadingFallback pageName="kanban board" />}
                >
                  <KanbanPage />
                </Suspense>
              }
            />

            {/* Projects */}
            <Route
              path="projects"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="projects" />}
                >
                  <ProjectsPage />
                </Suspense>
              }
            />
            <Route
              path="projects/create"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="project creation" />}
                >
                  <ProjectCreatePage />
                </Suspense>
              }
            />
            <Route
              path="projects/:id/edit"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="project editor" />}
                >
                  <ProjectEditPage />
                </Suspense>
              }
            />
            <Route
              path="projects/:id/requirements"
              element={
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="project requirements" />
                  }
                >
                  <RequirementsPage />
                </Suspense>
              }
            />
            <Route
              path="projects/:id/releases"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="project releases" />}
                >
                  <ReleasesPage />
                </Suspense>
              }
            />
            <Route
              path="projects/:id/settings"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="project settings" />}
                >
                  <ProjectEditPage />
                </Suspense>
              }
            />
            <Route
              path="projects/:id"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="project details" />}
                >
                  <ProjectDetailsPage />
                </Suspense>
              }
            />

            {/* Requirements */}
            <Route
              path="requirements"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="requirements" />}
                >
                  <RequirementsPage />
                </Suspense>
              }
            />
            <Route
              path="requirements/create"
              element={
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="requirement creation" />
                  }
                >
                  <RequirementCreatePage />
                </Suspense>
              }
            />
            <Route
              path="requirements/:id/edit"
              element={
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="requirement editor" />
                  }
                >
                  <RequirementCreatePage />
                </Suspense>
              }
            />
            <Route
              path="requirements/:id"
              element={
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="requirement details" />
                  }
                >
                  <RequirementDetailsPage />
                </Suspense>
              }
            />

            {/* Releases */}
            <Route
              path="releases"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="releases" />}
                >
                  <ReleasesPage />
                </Suspense>
              }
            />
            <Route
              path="releases/create"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="release creation" />}
                >
                  <ReleaseCreatePage />
                </Suspense>
              }
            />
            <Route
              path="releases/:id/edit"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="release editor" />}
                >
                  <ReleaseEditPage />
                </Suspense>
              }
            />
            <Route
              path="releases/:id"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="release details" />}
                >
                  <ReleaseDetailsPage />
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
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="test plan creation" />
                  }
                >
                  <TestPlanCreatePage />
                </Suspense>
              }
            />
            <Route
              path="testing/cases/create"
              element={
                <Suspense
                  fallback={
                    <PageLoadingFallback pageName="test case creation" />
                  }
                >
                  <TestCaseCreatePage />
                </Suspense>
              }
            />
            <Route
              path="testing/reports"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="test reports" />}
                >
                  <ReportsPage />
                </Suspense>
              }
            />
            <Route
              path="testing/execute"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="test execution" />}
                >
                  <TestingPage />
                </Suspense>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="admin panel" />}
                >
                  <AdminPage />
                </Suspense>
              }
            />

            {/* Settings */}
            <Route
              path="settings"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="settings" />}
                >
                  <SettingsPage />
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

            {/* Activity Routes */}
            <Route
              path="activity"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="activity" />}
                >
                  <DashboardPage />
                </Suspense>
              }
            />

            {/* Notifications */}
            <Route
              path="notifications"
              element={
                <Suspense
                  fallback={<PageLoadingFallback pageName="notifications" />}
                >
                  <DashboardPage />
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

            {/* History */}
            <Route
              path="history"
              element={
                <Suspense fallback={<PageLoadingFallback pageName="history" />}>
                  <DashboardPage />
                </Suspense>
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoadingFallback pageName="profile" />}>
                  <DashboardPage />
                </Suspense>
              }
            />
          </Route>

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <Suspense
                fallback={<PageLoadingFallback pageName="error page" />}
              >
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </RouteTransitionHandler>
  );
};
