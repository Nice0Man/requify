// Admin panel feature exports - UI components and business logic only
export { default as SystemHealthComponent } from './ui/SystemHealth';
export { default as UserManagementComponent } from './ui/UserManagement';

// API functions (business logic)
export * from './api/admin.api';

// Hooks for business logic
export * from './model/useAdminPanel';

// Re-export types from entities layer for convenience
export type {
  SystemInfo,
  SystemMetrics,
  UserManagement,
  AdminStats,
  HealthCheckResponse
} from '@/entities/admin'; 