export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRequirements: number;
  activeRequirements: number;
  completedTasks: number;
  teamMembers: number;
  changes: {
    projects: number;
    requirements: number;
    tasks: number;
    members: number;
  };
}

export interface DashboardState {
  stats: DashboardStats | null;
  isPending: boolean;
  error: string | null;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color?: string;
}

export interface DashboardMetricCategory {
  id: string;
  title: string;
  icon: string;
  color?: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  icon: string;
  color?: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface DashboardActivityFilters {
  type: string;
  status: string;
}

export interface DashboardMetricFilters {
  category: string;
  period: string;
}

export interface DashboardActivityFilters {
  type: string;
  status: string;
}

export interface DashboardMetricFilters {
  category: string;
  period: string;
}
