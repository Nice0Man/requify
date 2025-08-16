import type { 
  DashboardStats, 
  SystemHealth, 
  DashboardSystemMetrics,
  ActivityResponse,
  ActivityType,
  TimelineDataPoint,
  DistributionDataPoint 
} from "../model/types";
import type { 
  BackendDashboardStatsResponse, 
  BackendActivityItem, 
  BackendSystemMetrics,
  BackendTimelineDataPoint,
  BackendDistributionDataPoint 
} from "./types";

/**
 * Data transformation utilities for Dashboard API
 */
export class DashboardTransformers {
  
  /**
   * Transform backend dashboard stats to frontend format
   */
  static transformDashboardStats(data: BackendDashboardStatsResponse): DashboardStats {
    return {
      totalProjects: data.overview?.total_projects || 0,
      activeProjects: data.overview?.active_projects || 0,
      completedProjects: data.overview?.completed_projects || 0,
      totalRequirements: data.overview?.total_requirements || 0,
      activeRequirements: data.overview?.pending_requirements || 0,
      changes: {
        totalProjects: data.trending_metrics?.releases_this_month || 0,
        activeProjects: data.overview?.active_projects || 0,
        totalRequirements: data.trending_metrics?.requirements_this_week || 0,
        pendingRequirements: data.overview?.pending_requirements || 0,
        approvedRequirements: data.overview?.approved_requirements || 0,
        totalUsers: data.overview?.total_users || 0,
        activeUsers: data.overview?.active_users || 0,
      },
      trends: {
        totalProjects: {
          current: data.overview?.total_projects || 0,
          previous: (data.overview?.total_projects || 0) - 1,
          percentage: this.calculatePercentageChange(
            data.overview?.total_projects || 0,
            (data.overview?.total_projects || 0) - 1
          ),
          direction: this.getTrendDirection(
            data.overview?.total_projects || 0,
            (data.overview?.total_projects || 0) - 1
          ),
        },
        activeProjects: {
          current: data.overview?.active_projects || 0,
          previous: (data.overview?.active_projects || 0) - 1,
          percentage: this.calculatePercentageChange(
            data.overview?.active_projects || 0,
            (data.overview?.active_projects || 0) - 1
          ),
          direction: this.getTrendDirection(
            data.overview?.active_projects || 0,
            (data.overview?.active_projects || 0) - 1
          ),
        },
        completedProjects: {
          current: data.overview?.completed_projects || 0,
          previous: (data.overview?.completed_projects || 0) - 1,
          percentage: this.calculatePercentageChange(
            data.overview?.completed_projects || 0,
            (data.overview?.completed_projects || 0) - 1
          ),
          direction: this.getTrendDirection(
            data.overview?.completed_projects || 0,
            (data.overview?.completed_projects || 0) - 1
          ),
        },
        totalRequirements: {
          current: data.overview?.total_requirements || 0,
          previous: (data.overview?.total_requirements || 0) - 1,
          percentage: this.calculatePercentageChange(
            data.overview?.total_requirements || 0,
            (data.overview?.total_requirements || 0) - 1
          ),
          direction: this.getTrendDirection(
            data.overview?.total_requirements || 0,
            (data.overview?.total_requirements || 0) - 1
          ),
        },
        activeRequirements: {
          current: data.overview?.pending_requirements || 0,
          previous: (data.overview?.pending_requirements || 0) - 2,
          percentage: this.calculatePercentageChange(
            data.overview?.pending_requirements || 0,
            (data.overview?.pending_requirements || 0) - 2
          ),
          direction: this.getTrendDirection(
            data.overview?.pending_requirements || 0,
            (data.overview?.pending_requirements || 0) - 2
          ),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transform backend activity items to frontend format
   */
  static transformActivityItems(items: BackendActivityItem[]): ActivityResponse["data"] {
    return items
      .filter((item) => item && typeof item === "object" && (item.id || item.title))
      .map((item) => ({
        id: item.id || `activity_${Date.now()}_${Math.random()}`,
        type: (item.type as ActivityType) || "project_created",
        title: item.title || "Activity",
        description: item.description || "",
        timestamp: item.timestamp || new Date().toISOString(),
        user: {
          id: item.user_id || "unknown",
          name: item.user_name || "Unknown User",
          avatar: item.user_avatar,
        },
        metadata: {
          projectName: item.project_name,
          status: item.status,
        },
        priority: item.priority || "medium",
        read: false,
      }));
  }

  /**
   * Transform backend system metrics to frontend format
   */
  static transformSystemMetrics(data: BackendSystemMetrics): DashboardSystemMetrics {
    return {
      cpuUsage: data.cpu_usage,
      memoryUsage: data.memory_usage,
      diskUsage: data.disk_usage,
      networkLatency: data.network_latency,
      uptime: data.uptime,
      activeUsers: data.active_users,
      responseTime: data.response_time,
      errorRate: data.error_rate,
      throughput: data.throughput,
      availability: data.availability,
      lastUpdated: data.last_updated || new Date().toISOString(),
    };
  }

  /**
   * Transform timeline data
   */
  static transformTimelineData(items: BackendTimelineDataPoint[]): TimelineDataPoint[] {
    return (items || []).map((item) => ({
      date: item.date,
      value: item.value,
      category: item.category,
      metadata: item.metadata,
    }));
  }

  /**
   * Transform distribution data
   */
  static transformDistributionData(items: BackendDistributionDataPoint[]): DistributionDataPoint[] {
    return (items || []).map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      percentage: item.percentage || 0,
      color: item.color,
      metadata: item.metadata,
    }));
  }

  /**
   * Calculate percentage change between two values
   */
  private static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Determine trend direction
   */
  private static getTrendDirection(current: number, previous: number): "up" | "down" | "stable" {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  }
} 