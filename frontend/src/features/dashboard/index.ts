// Dashboard feature exports - overview and statistics using multiple entities
// Uses project, requirement, release, user, test-case entities

// Export dashboard API
export { dashboardApi } from './api';

// Export dashboard models and hooks  
export { useDashboard, useDashboardStats } from './model';
export type { 
  DashboardState, 
  DashboardStats,
  DashboardActivity,
  DashboardNotification
} from './model';

// Export dashboard UI components
export { 
  DashboardOverview,
  DashboardStats as DashboardStatsComponent,
  DashboardActivity as DashboardActivityComponent,
  DashboardQuickActions,
  DashboardRecentItems
} from './ui'; 