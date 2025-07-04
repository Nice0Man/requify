import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import type { 
  DashboardOverview,
  DashboardStats,
  DashboardActivity,
  DashboardNotification,
  DashboardProjectStats,
  DashboardRequirementStats
} from '../api/dashboard.api';

// =============================================================================
// Dashboard State Type
// =============================================================================

export interface DashboardState {
  overview: DashboardOverview | null;
  stats: DashboardStats | null;
  activity: DashboardActivity[];
  notifications: DashboardNotification[];
  projectStats: DashboardProjectStats[];
  requirementStats: DashboardRequirementStats | null;
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// Query Keys
// =============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
  notifications: (unreadOnly?: boolean) => [...dashboardKeys.all, 'notifications', unreadOnly] as const,
  projects: () => [...dashboardKeys.all, 'projects'] as const,
  projectStats: (projectId?: number) => [...dashboardKeys.projects(), 'stats', projectId] as const,
  requirements: () => [...dashboardKeys.all, 'requirements'] as const,
  requirementStats: (projectId?: number) => [...dashboardKeys.requirements(), 'stats', projectId] as const,
  myProjects: (limit?: number) => [...dashboardKeys.all, 'my-projects', limit] as const,
  myRequirements: (limit?: number) => [...dashboardKeys.all, 'my-requirements', limit] as const,
  recentProjects: (limit?: number) => [...dashboardKeys.all, 'recent-projects', limit] as const,
  recentRequirements: (limit?: number) => [...dashboardKeys.all, 'recent-requirements', limit] as const,
  search: (query: string, filters?: Record<string, any>) => [...dashboardKeys.all, 'search', query, filters] as const,
};

// =============================================================================
// Main Dashboard Hook
// =============================================================================

export const useDashboard = (refreshInterval?: number) => {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardApi.getOverview(),
    refetchInterval: refreshInterval || 5 * 60 * 1000, // 5 minutes default
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const activityQuery = useQuery({
    queryKey: dashboardKeys.activity(20),
    queryFn: () => dashboardApi.getActivity(20),
    refetchInterval: refreshInterval || 30 * 1000, // 30 seconds for activity
    staleTime: 15 * 1000, // 15 seconds
  });

  const notificationsQuery = useQuery({
    queryKey: dashboardKeys.notifications(),
    queryFn: () => dashboardApi.getNotifications(),
    refetchInterval: refreshInterval || 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
  });

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await dashboardApi.markNotificationRead(notificationId);
      queryClient.invalidateQueries({ queryKey: dashboardKeys.notifications() });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return {
    // Data
    overview: overviewQuery.data,
    activity: activityQuery.data || [],
    notifications: notificationsQuery.data || [],
    
    // Loading states
    isLoading: overviewQuery.isLoading || activityQuery.isLoading || notificationsQuery.isLoading,
    isRefreshing: overviewQuery.isFetching || activityQuery.isFetching || notificationsQuery.isFetching,
    
    // Error states
    error: overviewQuery.error || activityQuery.error || notificationsQuery.error,
    
    // Actions
    refresh: refreshDashboard,
    markNotificationRead,
  };
};

// =============================================================================
// Dashboard Stats Hook
// =============================================================================

export const useDashboardStats = (projectId?: number) => {
  const statsQuery = useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const projectStatsQuery = useQuery({
    queryKey: dashboardKeys.projectStats(projectId),
    queryFn: () => dashboardApi.getProjectStats(projectId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const requirementStatsQuery = useQuery({
    queryKey: dashboardKeys.requirementStats(projectId),
    queryFn: () => dashboardApi.getRequirementStats(projectId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return {
    // Data
    stats: statsQuery.data,
    projectStats: projectStatsQuery.data || [],
    requirementStats: requirementStatsQuery.data,
    
    // Loading states
    isLoading: statsQuery.isLoading || projectStatsQuery.isLoading || requirementStatsQuery.isLoading,
    
    // Error states
    error: statsQuery.error || projectStatsQuery.error || requirementStatsQuery.error,
    
    // Actions
    refetch: () => {
      statsQuery.refetch();
      projectStatsQuery.refetch();
      requirementStatsQuery.refetch();
    },
  };
};

// =============================================================================
// Dashboard Projects Hook
// =============================================================================

export const useDashboardProjects = (limit: number = 10) => {
  const myProjectsQuery = useQuery({
    queryKey: dashboardKeys.myProjects(limit),
    queryFn: () => dashboardApi.getMyProjects(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recentProjectsQuery = useQuery({
    queryKey: dashboardKeys.recentProjects(limit),
    queryFn: () => dashboardApi.getRecentProjects(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return {
    myProjects: myProjectsQuery.data || [],
    recentProjects: recentProjectsQuery.data || [],
    isLoading: myProjectsQuery.isLoading || recentProjectsQuery.isLoading,
    error: myProjectsQuery.error || recentProjectsQuery.error,
  };
};

// =============================================================================
// Dashboard Requirements Hook
// =============================================================================

export const useDashboardRequirements = (limit: number = 10) => {
  const myRequirementsQuery = useQuery({
    queryKey: dashboardKeys.myRequirements(limit),
    queryFn: () => dashboardApi.getMyRequirements(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recentRequirementsQuery = useQuery({
    queryKey: dashboardKeys.recentRequirements(limit),
    queryFn: () => dashboardApi.getRecentRequirements(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return {
    myRequirements: myRequirementsQuery.data || [],
    recentRequirements: recentRequirementsQuery.data || [],
    isLoading: myRequirementsQuery.isLoading || recentRequirementsQuery.isLoading,
    error: myRequirementsQuery.error || recentRequirementsQuery.error,
  };
};

// =============================================================================
// Dashboard Search Hook
// =============================================================================

export const useDashboardSearch = (query: string, filters?: Record<string, any>) => {
  const searchQuery = useQuery({
    queryKey: dashboardKeys.search(query, filters),
    queryFn: () => dashboardApi.search(query, filters),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    results: searchQuery.data,
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    isEnabled: query.length >= 2,
  };
}; 