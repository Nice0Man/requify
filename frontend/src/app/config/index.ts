export const config = {
  app: {
    name: 'Requify',
    version: '1.0.0',
    description: 'Requirements Management System',
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
  },
  auth: {
    tokenKey: 'authToken',
    refreshTokenKey: 'refreshToken',
  },
  ui: {
    theme: {
      default: 'light',
      storageKey: 'theme',
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
    },
  },
  features: {
    enableNotifications: true,
    enableRealTimeUpdates: true,
    enableOfflineMode: false,
  },
} as const; 
