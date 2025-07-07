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
