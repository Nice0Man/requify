import { client } from "@/shared/api/client";

export interface DashboardStats {
  activeProjects: number;
  totalProjects: number;
  activeRequirements: number;
  completedTasks: number;
  teamMembers: number;
  completionRate: number;
  teamVelocity: number;
  changes: {
    activeProjects: number;
    totalProjects: number;
    activeRequirements: number;
    completedTasks: number;
    teamMembers: number;
  };
}

export interface ActivityItem {
  id: string;
  type: "project" | "requirement" | "release" | "test";
  title: string;
  description: string;
  timestamp: string;
  user: string;
  userName: string; // alias for user
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await client.get("/dashboard/stats");
    return response.data;
  },

  // Get recent activity
  getActivity: async (limit: number = 10): Promise<ActivityItem[]> => {
    const response = await client.get(`/dashboard/activity?limit=${limit}`);
    return response.data.map((item: any) => ({
      ...item,
      userName: item.user || item.userName, // ensure both fields are available
    }));
  },

  // Get recent activity (alias for compatibility with useDashboardQuery)
  getRecentActivity: async (): Promise<ActivityItem[]> => {
    return dashboardApi.getActivity(20); // Get 20 recent items
  },

  // Get chart data for different periods
  getChartData: async (period: 'week' | 'month' | 'year' = 'week'): Promise<ChartDataPoint[]> => {
    const response = await client.get(`/dashboard/chart-data?period=${period}`);
    return response.data;
  },

  // Get system health status
  getSystemHealth: async () => {
    const response = await client.get("/dashboard/health");
    return response.data;
  },
};
