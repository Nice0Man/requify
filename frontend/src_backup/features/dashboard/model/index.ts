// Dashboard model exports
export { 
  useDashboard, 
  useDashboardStats,
  useDashboardProjects,
  useDashboardRequirements 
} from './dashboard.hooks';
export type { 
  DashboardOverview,
  DashboardStats,
  DashboardActivity,
  DashboardNotification,
  DashboardQuickStats,
  DashboardProjectStats,
  DashboardRequirementStats
} from '../api/dashboard.api'; 