// API endpoints согласно бэкенд документации
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VALIDATE_TOKEN: "/auth/validate-token",
    CHANGE_PASSWORD: "/auth/change-password",
    RESET_PASSWORD: "/auth/reset-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD_CONFIRM: "/auth/reset-password/confirm",
    VERIFY_EMAIL_REQUEST: "/auth/verify-email/request",
    VERIFY_EMAIL_CONFIRM: "/auth/verify-email/confirm",
    SESSIONS: "/auth/sessions",
    SESSIONS_REVOKE: "/auth/sessions/revoke",
    OAUTH2_AUTH0: "/auth/oauth2/auth0",
    OAUTH2_AUTH0_USERINFO: "/auth/oauth2/auth0/userinfo",
    OAUTH2_AUTH0_STATUS: "/auth/oauth2/auth0/status",
  },

  // User endpoints
  USERS: {
    LIST: "/users/",
    CREATE: "/users/",
    ME: {
      ROOT: "/users/me",
      UPDATE: "/users/me",
      SETTINGS: "/users/me/settings", // TODO: implement sidebar preferences on backend
      ACTIVITY: "/users/me/activity",
      PROFILE: "/users/me/profile",
      AVATAR: "/users/me/avatar", // TODO: implement avatar upload on backend
    },
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    // Additional endpoints for userDAO.ts
    DETAIL: (id: number) => `/users/${id}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    BY_EMAIL: (email: string) => `/users/email/${email}`,
    PROFILE: (id: number) => `/users/${id}/profile`,
    STATS: (id: number) => `/users/${id}/stats`,
    ACTIVITY: (id: number) => `/users/${id}/activity`,
    VALIDATE: "/users/validate",
    CHECK_USERNAME: (username: string) => `/users/check-username/${username}`,
    CHECK_EMAIL: (email: string) => `/users/check-email/${email}`,
    AUDIT: (id: number) => `/users/${id}/audit`,
    SETTINGS: (id: number) => `/users/${id}/settings`,
    ME_SETTINGS: "/users/me/settings",
    SEARCH: "/users/search",
  },

  // Project endpoints
  PROJECTS: {
    LIST: "/projects/",
    CREATE: "/projects/",
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    REQUIREMENTS: (id: string) => `/projects/${id}/requirements`,
    SYNC_TO_RELEASE: (id: string) => `/projects/${id}/sync-to-release`,
    RELEASES: (id: string) => `/projects/${id}/releases`,
    STATS: (id: string) => `/projects/${id}/stats`,
    // Additional endpoints for projectDAO.ts
    REMOVE_TEAM_MEMBER: (id: string, userId: string) =>
      `/projects/${id}/team/${userId}`,
    BULK: "/projects/bulk",
    IMPORT: "/projects/import",
    EXPORT: "/projects/export",
    ARCHIVE: (id: string) => `/projects/${id}/archive`,
    UNARCHIVE: (id: string) => `/projects/${id}/unarchive`,
    FAVORITE: (id: string) => `/projects/${id}/favorite`,
  },

  // Requirement endpoints
  REQUIREMENTS: {
    SEARCH: "/requirements/search",
    LIST: "/requirements/",
    CREATE: "/requirements/",
    GET: (id: string) => `/requirements/${id}`,
    UPDATE: (id: string) => `/requirements/${id}`,
    DELETE: (id: string) => `/requirements/${id}`,
    CHANGE_STATUS: (id: string) => `/requirements/${id}/change-status`,
    UPDATE_PROGRESS: (id: string) => `/requirements/${id}/progress`,
    TESTS: (id: string) => `/requirements/${id}/tests`,
    RELATIONSHIPS: (id: string) => `/requirements/${id}/relationships`,
    CREATE_RELATIONSHIP: (id: string) => `/requirements/${id}/relationships`,
  },

  // Release endpoints
  RELEASES: {
    LIST: "/releases/",
    CREATE: "/releases/",
    CREATE_FROM_REQUIREMENTS: "/releases/create-from-requirements",
    GET: (id: string) => `/releases/${id}`,
    UPDATE: (id: string) => `/releases/${id}`,
    DELETE: (id: string) => `/releases/${id}`,
    GENERATE_SPECIFICATION: (id: string) =>
      `/releases/${id}/generate-specification`,
    PUBLISH: (id: string) => `/releases/${id}/publish`,
    REQUIREMENTS: (id: string) => `/releases/${id}/requirements`,
    CHANGELOG: (id: string) => `/releases/${id}/changelog`,
    SYNC_PROJECT_REQUIREMENTS: (id: string) =>
      `/releases/${id}/sync-project-requirements`,
  },

  // Testing endpoints
  TESTING: {
    RESULTS: "/testing/results",
    PLANS: "/testing/plans",
    CREATE_PLAN: "/testing/plans",
    GET_PLAN: (id: string) => `/testing/plans/${id}`,
    CASES: "/testing/cases",
    CREATE_CASE: "/testing/cases",
    EXECUTIONS: "/testing/executions",
    EXECUTE_CASE: "/testing/executions",
    SUMMARY_REPORT: "/testing/reports/summary",
    REQUIREMENT_STATUS: "/testing/asuts/requirement-status",
    RELEASE_STATUS: "/testing/asuts/release-status",
    INTEGRATION_RUN: "/testing/integration/run",
    INTEGRATION_STATUS: (jobId: string) =>
      `/testing/integration/status/${jobId}`,
  },

  // Admin endpoints
  ADMIN: {
    USERS: "/admin/users",
    SYSTEM_INFO: "/admin/system-info",
    HEALTH: "/admin/health",
    METRICS: "/admin/metrics",
    LOGS: "/admin/logs",
    USERS_STATS: "/admin/users-stats",
    PROJECTS_STATS: "/admin/projects-stats",
    BACKUP: "/admin/backup",
    BACKUPS: "/admin/backups",
    SYSTEM_SETTINGS: "/admin/system-settings",
    AUDIT_LOG: "/admin/audit-log",
  },

  // Reference endpoints
  REFERENCE: {
    REQUIREMENT_TYPES: "/reference/requirement-types",
    CREATE_REQUIREMENT_TYPE: "/reference/requirement-types",
    REQUIREMENT_PRIORITIES: "/reference/requirement-priorities",
    CREATE_REQUIREMENT_PRIORITY: "/reference/requirement-priorities",
    REQUIREMENT_STATUSES: "/reference/requirement-statuses",
    CREATE_REQUIREMENT_STATUS: "/reference/requirement-statuses",
    RELATIONSHIP_TYPES: "/reference/relationship-types",
    CREATE_RELATIONSHIP_TYPE: "/reference/relationship-types",
  },

  // Specification endpoints
  SPECIFICATIONS: {
    LIST: "/specifications/",
    CREATE: "/specifications/",
    GET: (id: string) => `/specifications/${id}`,
    UPDATE: (id: string) => `/specifications/${id}`,
    DELETE: (id: string) => `/specifications/${id}`,
    REQUIREMENTS: (id: string) => `/specifications/${id}/requirements`,
    GENERATE_DOCUMENT: (id: string) =>
      `/specifications/${id}/generate-document`,
  },

  // Relationship endpoints
  RELATIONSHIPS: {
    LIST: "/relationships/",
    CREATE: "/relationships/",
    GET: (id: string) => `/relationships/${id}`,
    UPDATE: (id: string) => `/relationships/${id}`,
    DELETE: (id: string) => `/relationships/${id}`,
    REQUIREMENT_RELATIONSHIPS: (reqId: string) =>
      `/relationships/requirements/${reqId}/relationships`,
    CREATE_REQUIREMENT_RELATIONSHIP: (reqId: string) =>
      `/relationships/requirements/${reqId}/relationships`,
    REQUIREMENT_DEPENDENCIES: (reqId: string) =>
      `/relationships/requirements/${reqId}/dependencies`,
    REQUIREMENT_DEPENDENTS: (reqId: string) =>
      `/relationships/requirements/${reqId}/dependents`,
    REQUIREMENT_TRACE_MATRIX: (reqId: string) =>
      `/relationships/requirements/${reqId}/trace-matrix`,
  },

  // Comment endpoints
  COMMENTS: {
    LIST: "/comments/",
    CREATE: "/comments/",
    GET: (id: string) => `/comments/${id}`,
    UPDATE: (id: string) => `/comments/${id}`,
    DELETE: (id: string) => `/comments/${id}`,
    REQUIREMENT_COMMENTS: (reqId: string) =>
      `/comments/requirements/${reqId}/comments`,
    CREATE_REQUIREMENT_COMMENT: (reqId: string) =>
      `/comments/requirements/${reqId}/comments`,
    RECENT: "/comments/recent",
    STATISTICS: "/comments/statistics",
  },

  // Dashboard endpoints - Обновлено согласно документации API v1
  DASHBOARD: {
    ROOT: "/dashboard/",
    STATS: "/dashboard/stats",
    OVERVIEW: "/dashboard/overview",
    MY_PROJECTS: "/dashboard/my-projects",
    MY_REQUIREMENTS: "/dashboard/my-requirements",
    MY_ACTIVITY: "/dashboard/my-activity",
    MY_NOTIFICATIONS: "/dashboard/my-notifications",
    RECENT_ACTIVITY: "/dashboard/activity/recent",
    PROJECTS_STATS: "/dashboard/projects/stats",
    RECENT_PROJECTS: "/dashboard/projects/recent",
    REQUIREMENTS_STATS: "/dashboard/requirements/stats",
    RECENT_REQUIREMENTS: "/dashboard/requirements/recent",
    HEALTH: "/dashboard/health",
    METRICS: "/dashboard/metrics",
    SEARCH: "/dashboard/search",
    FILTER: "/dashboard/filter",
    EXPORT_STATS: "/dashboard/export/stats",
    EXPORT_ACTIVITY: "/dashboard/export/activity",
    MY_DASHBOARD: "/dashboard/my-dashboard",
    ACTIVITY: "/dashboard/activity",
    CREATE_ACTIVITY: "/dashboard/activity",
    PREFERENCES: "/dashboard/preferences",
    NOTIFICATIONS: "/dashboard/notifications",
    MARK_NOTIFICATION_READ: (id: string) =>
      `/dashboard/notifications/${id}/read`,
    // System metrics
    SYSTEM_METRICS: "/dashboard/metrics/system",
    // Chart data endpoints
    CHARTS: {
      TIMELINE: "/dashboard/charts/timeline",
      DISTRIBUTION: "/dashboard/charts/distribution",
      PROJECT_TRENDS: "/dashboard/charts/project-trends",
    },
  },

  // Teams endpoints
  TEAMS: {
    LIST: "/teams/",
    CREATE: "/teams/",
    GET: (id: string) => `/teams/${id}`,
    UPDATE: (id: string) => `/teams/${id}`,
    DELETE: (id: string) => `/teams/${id}`,
    ARCHIVE: (id: string) => `/teams/${id}/archive`,
    RESTORE: (id: string) => `/teams/${id}/restore`,
    MEMBERS: (id: string) => `/teams/${id}/members`,
    ADD_MEMBER: (id: string) => `/teams/${id}/members`,
    UPDATE_MEMBER: (id: string, userId: string) =>
      `/teams/${id}/members/${userId}`,
    REMOVE_MEMBER: (id: string, userId: string) =>
      `/teams/${id}/members/${userId}`,
    CHANGE_MEMBER_ROLE: (id: string, userId: string) =>
      `/teams/${id}/members/${userId}/role`,
    BULK_CREATE: "/teams/bulk/create",
    BULK_ADD_MEMBERS: (id: string) => `/teams/${id}/members/bulk/add`,
    STATS_OVERVIEW: "/teams/stats/overview",
    TEAM_STATS: (id: string) => `/teams/${id}/stats`,
    CHECK_PERMISSIONS: "/teams/permissions/check",
  },

  // Integration endpoints
  // not implemented on backend yet
  INTEGRATIONS: {
    LIST: "/integrations/",
    GET: (id: string) => `/integrations/${id}`,
    CATEGORIES: "/integrations/categories",
    POPULAR: "/integrations/popular",
    CONNECT: "/integrations/connect",
    DISCONNECT: (connectionId: string) =>
      `/integrations/connections/${connectionId}`,
    CONNECTION_STATUS: (integrationId: string) =>
      `/integrations/${integrationId}/status`,
    SYNC: (connectionId: string) =>
      `/integrations/connections/${connectionId}/sync`,
    CONNECTIONS: "/integrations/connections",
    AVAILABLE: "/integrations/available",
  },

  // Email endpoints
  // not implemented on backend yet
  EMAIL: {
    SUBSCRIBE: "/email/subscribe",
    UNSUBSCRIBE: "/email/unsubscribe",
  },

  // Root endpoints
  ROOT: "/",
  API_ROOT: "/",
  HEALTH_CHECK: "/health",
} as const;
