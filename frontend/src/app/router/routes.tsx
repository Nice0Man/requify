import React from "react";

// Lazy loading pages
const DashboardPage = React.lazy(() => import("@/pages/dashboard"));
const AuthPage = React.lazy(() => import("@/pages/auth"));
const LandingPage = React.lazy(() => import("@/pages/landing"));
const ProjectsPage = React.lazy(() => import("@/pages/projects"));
const RequirementsPage = React.lazy(() => import("@/pages/requirements"));
const ReleasesPage = React.lazy(() => import("@/pages/releases"));
const TestingPage = React.lazy(() => import("@/pages/testing"));
const ReportsPage = React.lazy(() => import("@/pages/reports"));
const SettingsPage = React.lazy(() => import("@/pages/settings"));
const AdminPage = React.lazy(() => import("@/pages/admin"));
const NotFoundPage = React.lazy(() => import("@/pages/not-found"));
const DemoNewLayoutPage = React.lazy(() => import("@/pages/demo/ui/DemoNewLayoutPage"));

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  isProtected: boolean;
  requiredRole?: string; // TODO: change to UserRole
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
  
  // Protected routes
  {
    path: "/dashboard",
    element: <DashboardPage />,
    isProtected: true,
  },
  {
    path: "/projects/*",
    element: <ProjectsPage />,
    isProtected: true,
  },
  {
    path: "/requirements/*",
    element: <RequirementsPage />,
    isProtected: true,
  },
  {
    path: "/releases/*",
    element: <ReleasesPage />,
    isProtected: true,
  },
  {
    path: "/testing/*",
    element: <TestingPage />,
    isProtected: true,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
    isProtected: true,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    isProtected: true,
  },
  {
    path: "/admin/*",
    element: <AdminPage />,
    isProtected: true,
    requiredRole: "admin",
  },
  
  // Demo pages for development
  {
    path: "/demo/new-layout",
    element: <DemoNewLayoutPage />,
    isProtected: true,
  },
  
  // 404 page
  {
    path: "*",
    element: <NotFoundPage />,
    isProtected: false,
  },
];
