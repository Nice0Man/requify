import React from "react";
import { UserRole } from "@/entities/user";

// Lazy loading pages
const DashboardPage = React.lazy(() => import("@/pages/dashboard"));
const AuthPage = React.lazy(() => import("@/pages/auth/ui/AuthPage"));
const EmailConfirmationPage = React.lazy(
  () => import("@/pages/auth/ui/EmailConfirmationPage")
);
const EmailVerificationPage = React.lazy(
  () => import("@/pages/auth/ui/EmailVerificationPage")
);
const ViewerPage = React.lazy(() => import("@/pages/viewer").then(module => ({ default: module.ViewerPage })));
const LandingPage = React.lazy(() => import("@/pages/landing"));
const ProjectsPage = React.lazy(() => import("@/pages/projects"));
const RequirementsPage = React.lazy(() => import("@/pages/requirements"));
const ReleasesPage = React.lazy(() => import("@/pages/releases"));
const TestingPage = React.lazy(() => import("@/pages/testing"));
const ReportsPage = React.lazy(() => import("@/pages/reports"));
const SettingsPage = React.lazy(() => import("@/pages/settings"));
const AdminPage = React.lazy(() => import("@/pages/admin"));
const NotFoundPage = React.lazy(() => import("@/pages/not-found"));
const KanbanPage = React.lazy(() => import("@/pages/kanban"));

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  isProtected: boolean;
  requiredRoles?: UserRole[];
}

export const routes: RouteConfig[] = [
  // Landing page
  {
    path: "/",
    element: <LandingPage />,
    isProtected: false,
  },

  // Authentication routes - all public
  {
    path: "/auth/*",
    element: <AuthPage />,
    isProtected: false,
  },
  {
    path: "/login",
    element: <AuthPage />,
    isProtected: false,
  },
  {
    path: "/register",
    element: <AuthPage />,
    isProtected: false,
  },
  {
    path: "/forgot-password",
    element: <AuthPage />,
    isProtected: false,
  },
  {
    path: "/reset-password",
    element: <AuthPage />,
    isProtected: false,
  },
  {
    path: "/email-confirmation",
    element: <EmailConfirmationPage />,
    isProtected: false,
  },
  {
    path: "/verify-email",
    element: <EmailVerificationPage />,
    isProtected: false,
  },
  {
    path: "/viewer",
    element: <ViewerPage />,
    isProtected: true,
    requiredRoles: ["viewer"],
  },

  // Protected routes
  {
    path: "/dashboard",
    element: <DashboardPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/projects/*",
    element: <ProjectsPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/requirements/*",
    element: <RequirementsPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/releases/*",
    element: <ReleasesPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/testing/*",
    element: <TestingPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/reports/*",
    element: <ReportsPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/kanban/*",
    element: <KanbanPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
    ],
  },
  {
    path: "/settings/*",
    element: <SettingsPage />,
    isProtected: true,
    requiredRoles: [
      "admin",
      "project_manager",
      "analyst",
      "developer",
      "tester",
      "viewer",
    ],
  },

  {
    path: "/admin/*",
    element: <AdminPage />,
    isProtected: true,
    requiredRoles: ["admin"],
  },
  // 404 page
  {
    path: "*",
    element: <NotFoundPage />,
    isProtected: false,
  },
];
