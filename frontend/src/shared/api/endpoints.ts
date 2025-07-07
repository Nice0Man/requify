// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile',
  },
  
  // User endpoints
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Project endpoints
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    STATS: (id: string) => `/projects/${id}/stats`,
  },
  
  // Requirement endpoints
  REQUIREMENTS: {
    LIST: '/requirements',
    CREATE: '/requirements',
    GET: (id: string) => `/requirements/${id}`,
    UPDATE: (id: string) => `/requirements/${id}`,
    DELETE: (id: string) => `/requirements/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/requirements`,
  },
  
  // Release endpoints
  RELEASES: {
    LIST: '/releases',
    CREATE: '/releases',
    GET: (id: string) => `/releases/${id}`,
    UPDATE: (id: string) => `/releases/${id}`,
    DELETE: (id: string) => `/releases/${id}`,
    BY_PROJECT: (projectId: string) => `/projects/${projectId}/releases`,
  },
  
  // Test case endpoints
  TEST_CASES: {
    LIST: '/test-cases',
    CREATE: '/test-cases',
    GET: (id: string) => `/test-cases/${id}`,
    UPDATE: (id: string) => `/test-cases/${id}`,
    DELETE: (id: string) => `/test-cases/${id}`,
    BY_REQUIREMENT: (requirementId: string) => `/requirements/${requirementId}/test-cases`,
  },
  
  // Comment endpoints
  COMMENTS: {
    LIST: '/comments',
    CREATE: '/comments',
    GET: (id: string) => `/comments/${id}`,
    UPDATE: (id: string) => `/comments/${id}`,
    DELETE: (id: string) => `/comments/${id}`,
    BY_ENTITY: (entityType: string, entityId: string) => `/comments/${entityType}/${entityId}`,
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    SYSTEM: '/admin/system',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    NOTIFICATIONS: '/dashboard/notifications',
  },
} as const; 