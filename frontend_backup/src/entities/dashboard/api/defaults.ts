import type { 
  DashboardStats, 
  SystemHealth, 
  DashboardSystemMetrics, 
  DashboardPreferences 
} from "../model/types";

/**
 * Default values and fallback data for Dashboard API
 */
export class DashboardDefaults {
  
  /**
   * Get default dashboard statistics
   */
  static getDefaultStats(): DashboardStats {
    const timestamp = new Date().toISOString();

    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalRequirements: 0,
      activeRequirements: 0,
      changes: {},
      trends: {
        totalProjects: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        activeProjects: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        completedProjects: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        totalRequirements: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        activeRequirements: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
      },
      timestamp,
    };
  }

  /**
   * Get default system health
   */
  static getDefaultSystemHealth(): SystemHealth {
    return {
      status: "healthy",
      uptime: 99.9,
      responseTime: 150,
      services: {
        database: { status: "healthy", responseTime: 10 },
        api: { status: "healthy", responseTime: 50 },
        cache: { status: "healthy", responseTime: 5 },
        storage: { status: "healthy", responseTime: 20 },
      },
      alerts: [],
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Get default system metrics
   */
  static getDefaultSystemMetrics(): DashboardSystemMetrics {
    return {
      cpuUsage: 45.2,
      memoryUsage: 62.8,
      diskUsage: 78.3,
      networkLatency: 12.5,
      uptime: 99.9,
      activeUsers: 0,
      responseTime: 145,
      errorRate: 0.02,
      throughput: 1250,
      availability: 99.95,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get default dashboard preferences
   */
  static getDefaultPreferences(): DashboardPreferences {
    return {
      layout: "grid",
      theme: "light",
      density: "comfortable",
      refreshInterval: 30000,
      widgets: {
        stats: { visible: true, position: { x: 0, y: 0 } },
        activity: { visible: true, position: { x: 1, y: 0 } },
        quickActions: { visible: true, position: { x: 0, y: 1 } },
        systemHealth: { visible: true, position: { x: 1, y: 1 } },
      },
      notifications: {
        email: true,
        push: false,
        inApp: true,
      },
    };
  }
} 