export const ROUTES = {
  // Public routes
  ROOT: "/",
  LOGIN: "/login",
  START: "/start",
  API_OVERVIEW: "/api-overview",

  // Auth routes
  AUTH: {
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    VERIFY_EMAIL: "/verify-email",
  },

  // Private routes
  DASHBOARD: "/dashboard",

  // Projects
  PROJECTS: {
    LIST: "/projects",
    CREATE: "/projects/create",
    DETAILS: (id: string) => `/projects/${id}`,
    EDIT: (id: string) => `/projects/${id}/edit`,
    REQUIREMENTS: (id: string) => `/projects/${id}/requirements`,
    RELEASES: (id: string) => `/projects/${id}/releases`,
    SETTINGS: (id: string) => `/projects/${id}/settings`,
  },

  // Requirements
  REQUIREMENTS: {
    LIST: "/requirements",
    CREATE: "/requirements/create",
    DETAILS: (id: string) => `/requirements/${id}`,
    EDIT: (id: string) => `/requirements/${id}/edit`,
  },

  // Testing
  TESTING: {
    LIST: "/testing",
    PLANS_CREATE: "/testing/plans/create",
    CASES_CREATE: "/testing/cases/create",
    REPORTS: "/testing/reports",
    EXECUTE: "/testing/execute",
  },

  // Releases
  RELEASES: {
    LIST: "/releases",
    CREATE: "/releases/create",
    DETAILS: (id: string) => `/releases/${id}`,
    EDIT: (id: string) => `/releases/${id}/edit`,
  },

  // Other
  KANBAN: "/kanban",
  ACTIVITY: "/activity",
  NOTIFICATIONS: "/notifications",
  TEAM: "/team",
  HISTORY: "/history",
  REPORTS: "/reports",
  ADMIN: "/admin",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;
