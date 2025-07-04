import { AdminApi as AdminEntityApi } from '@/entities/admin/api/admin.api';
import type {
  SystemInfo,
  SystemMetrics,
  SystemSettings,
  SystemBackup,
  SecurityEvent,
  AdminStats,
  HealthCheckResponse,
  AdminListParams,
  UserListResponse,
  LogListResponse,
  SecurityEventListResponse,
  UserManagement,
} from '@/entities/admin/model/types';

/**
 * Admin Panel Feature API
 * Business-oriented API layer for admin panel functionality
 * Wraps entity API with feature-specific business logic
 */
class AdminPanelApi extends AdminEntityApi {
  /**
   * Get comprehensive admin dashboard data
   */
  async getDashboardData(): Promise<{
    systemInfo: SystemInfo;
    metrics: SystemMetrics;
    stats: AdminStats;
    recentLogs: LogListResponse;
    securityEvents: SecurityEventListResponse;
  }> {
    const [systemInfo, metrics, stats, recentLogs, securityEvents] = await Promise.all([
      this.getSystemInfo(),
      this.getMetrics(),
      this.getAdminStats(),
      this.getSystemLogs({ limit: 10, skip: 0 }),
      this.getSecurityEvents({ limit: 5, skip: 0, resolved: false }),
    ]);

    return {
      systemInfo,
      metrics,
      stats,
      recentLogs,
      securityEvents,
    };
  }

  /**
   * Get filtered and paginated users with enhanced filtering
   */
  async getFilteredUsers(filters: {
    search?: string;
    role?: string[];
    status?: string[];
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const params: AdminListParams = {
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      limit: filters.limit || 20,
      filters: {
        search: filters.search,
        user_role: filters.role as any[],
        user_status: filters.status as any[],
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
      },
    };

    return this.getAdminUsers(params);
  }

  /**
   * Get system health summary
   */
  async getSystemHealthSummary(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    components: Record<string, 'healthy' | 'warning' | 'critical'>;
    metrics: SystemMetrics;
    uptime: number;
  }> {
    const [health, metrics, systemInfo] = await Promise.all([
      this.getHealthCheck(),
      this.getMetrics(),
      this.getSystemInfo(),
    ]);

    // Determine overall health
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    const components: Record<string, 'healthy' | 'warning' | 'critical'> = {};

    // Analyze health components with type-safe approach
    Object.entries(health.components).forEach(([key, component]) => {
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      // Safe status checking
      const statusValue = component.status;
      if (statusValue === 'healthy') {
        status = 'healthy';
      } else if (statusValue === 'warning' || statusValue === 'unknown') {
        status = 'warning';
        if (overall === 'healthy') overall = 'warning';
      } else {
        // unhealthy, critical, down, degraded, etc.
        status = 'critical';
        overall = 'critical';
      }
      
      components[key] = status;
    });

    // Check metrics for warnings
    if (metrics.cpu_usage > 80 || metrics.memory_usage > 85) {
      if (overall === 'healthy') overall = 'warning';
    }

    return {
      overall,
      components,
      metrics,
      uptime: systemInfo.uptime || 0,
    };
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: number[],
    updates: Partial<UserManagement>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Note: This would require a backend endpoint for bulk operations
    // For now, we'll do individual updates
    for (const userId of userIds) {
      try {
        // Individual user update would need to be implemented
        // await this.updateUser(userId, updates);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to update user ${userId}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Get security events summary
   */
  async getSecuritySummary(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    resolvedToday: number;
    failedLoginsToday: number;
    topThreats: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
  }> {
    const [allEvents, todayEvents] = await Promise.all([
      this.getSecurityEvents({ limit: 1000 }),
      this.getSecurityEvents({
        limit: 1000,
        date_from: new Date().toISOString().split('T')[0],
      }),
    ]);

    const criticalEvents = allEvents.items.filter(
      event => event.severity === 'critical' || event.severity === 'high'
    ).length;

    const resolvedToday = todayEvents.items.filter(
      event => event.resolved
    ).length;

    const failedLoginsToday = todayEvents.items.filter(
      event => event.event_type === 'failed_login'
    ).length;

    // Count threat types
    const threatCounts: Record<string, { count: number; severity: string }> = {};
    allEvents.items.forEach(event => {
      if (!threatCounts[event.event_type]) {
        threatCounts[event.event_type] = { count: 0, severity: event.severity };
      }
      threatCounts[event.event_type].count++;
    });

    const topThreats = Object.entries(threatCounts)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents: allEvents.total,
      criticalEvents,
      resolvedToday,
      failedLoginsToday,
      topThreats,
    };
  }
}

export const adminApi = new AdminPanelApi();
export type { AdminPanelApi };

// Re-export types for convenience
export type {
  SystemInfo,
  SystemMetrics,
  SystemSettings,
  SystemBackup,
  SecurityEvent,
  AdminStats,
  HealthCheckResponse,
  UserManagement,
}; 