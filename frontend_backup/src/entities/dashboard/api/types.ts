/**
 * Backend response types matching backend schemas
 */
export interface BackendDashboardOverviewStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_requirements: number;
  pending_requirements: number;
  approved_requirements: number;
  total_users: number;
  active_users: number;
}

export interface BackendProjectPerformanceStats {
  completion_rate: number;
  on_time_delivery: number;
  quality_score: number;
  team_productivity: number;
}

export interface BackendTrendingMetricsData {
  requirements_this_week: number;
  requirements_last_week: number;
  releases_this_month: number;
  releases_last_month: number;
  active_teams: number;
  avg_project_duration: number;
}

export interface BackendDashboardStatsResponse {
  overview: BackendDashboardOverviewStats;
  project_performance: BackendProjectPerformanceStats;
  trending_metrics: BackendTrendingMetricsData;
  charts?: {
    timeline: BackendTimelineDataPoint[];
    distribution: BackendDistributionDataPoint[];
  };
}

export interface BackendActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  project_name?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
}

export interface BackendSystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  uptime: number;
  active_users: number;
  response_time: number;
  error_rate: number;
  throughput: number;
  availability: number;
  last_updated?: string;
}

export interface BackendTimelineDataPoint {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface BackendDistributionDataPoint {
  id: string;
  label: string;
  value: number;
  percentage?: number;
  color: string;
  metadata?: Record<string, any>;
} 