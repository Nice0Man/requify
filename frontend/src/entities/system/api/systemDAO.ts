/**
 * System Data Access Object (DAO)
 * Для работы с API мониторинга здоровья системы
 * Использует только существующие API_ENDPOINTS
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  SystemMetric,
  SystemService,
  SystemIncident,
  SystemHealthOverview,
  SystemMetricDTO,
  SystemServiceDTO,
  SystemIncidentDTO,
  SystemHealthOverviewDTO,
  SystemHealthFilters,
  SystemMetricsResponse,
  SystemServicesResponse,
  SystemIncidentsResponse,
  SystemHealthResponse,
  HealthStatus,
  MetricType,
} from "../model/types";

/**
 * Мапперы для преобразования DTO в Domain типы
 */
class SystemMappers {
  static metricFromDTO(dto: SystemMetricDTO): SystemMetric {
    return {
      id: dto.id,
      type: dto.type as MetricType,
      name: dto.name,
      description: dto.description,
      value: dto.value,
      previousValue: dto.previous_value,
      maxValue: dto.max_value,
      unit: dto.unit as any,
      status: dto.status as HealthStatus,
      thresholds: {
        warning: dto.warning_threshold,
        critical: dto.critical_threshold,
      },
      lastUpdated: new Date(dto.last_updated),
      trend: dto.trend as any,
      changePercent: dto.change_percent,
      color: dto.color,
    };
  }

  static serviceFromDTO(dto: SystemServiceDTO): SystemService {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      status: dto.status as HealthStatus,
      url: dto.url,
      responseTime: dto.response_time,
      lastCheck: new Date(dto.last_check),
      uptime: dto.uptime,
      errorMessage: dto.error_message,
      version: dto.version,
      dependencies: dto.dependencies,
    };
  }

  static incidentFromDTO(dto: SystemIncidentDTO): SystemIncident {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status as any,
      severity: dto.severity as any,
      affectedServices: dto.affected_services,
      startTime: new Date(dto.start_time),
      endTime: dto.end_time ? new Date(dto.end_time) : undefined,
      updates: dto.updates.map(update => ({
        time: new Date(update.time),
        message: update.message,
        author: update.author,
      })),
    };
  }

  static overviewFromDTO(dto: SystemHealthOverviewDTO): SystemHealthOverview {
    return {
      overallStatus: dto.overall_status as HealthStatus,
      uptime: dto.uptime,
      totalServices: dto.total_services,
      healthyServices: dto.healthy_services,
      activeIncidents: dto.active_incidents,
      lastUpdated: new Date(dto.last_updated),
      statusMessage: dto.status_message,
    };
  }
}

/**
 * SystemDAO - класс для работы с API системы
 * Использует только существующие endpoints из API_ENDPOINTS
 */
export class SystemDAO {
  private static instance: SystemDAO;

  private constructor() {}

  static getInstance(): SystemDAO {
    if (!SystemDAO.instance) {
      SystemDAO.instance = new SystemDAO();
    }
    return SystemDAO.instance;
  }

  /**
   * Получить общий обзор здоровья системы
   * Использует API_ENDPOINTS.ADMIN.HEALTH
   */
  async getSystemHealth(filters?: SystemHealthFilters): Promise<{
    overview: SystemHealthOverview;
    metrics: SystemMetric[];
    services: SystemService[];
    incidents: SystemIncident[];
  }> {
    try {
      const params = this.buildFiltersParams(filters);
      
      // Используем существующий endpoint для health check
      const healthResponse = await client.get(API_ENDPOINTS.ADMIN.HEALTH, { params });
      
      // Создаем mock данные на основе health check
      const mockOverview: SystemHealthOverviewDTO = {
        overall_status: healthResponse.data.status === "ok" ? "healthy" : "critical",
        uptime: 99.5,
        total_services: 5,
        healthy_services: healthResponse.data.status === "ok" ? 5 : 3,
        active_incidents: 0,
        last_updated: new Date().toISOString(),
        status_message: healthResponse.data.message || "Система работает нормально",
      };

      return {
        overview: SystemMappers.overviewFromDTO(mockOverview),
        metrics: [], // TODO: реализовать когда будет API
        services: [], // TODO: реализовать когда будет API
        incidents: [], // TODO: реализовать когда будет API
      };
    } catch (error) {
      console.error("Ошибка получения данных о здоровье системы:", error);
      throw new Error("Не удалось получить данные о здоровье системы");
    }
  }

  /**
   * Получить метрики системы
   * Использует API_ENDPOINTS.ADMIN.METRICS
   */
  async getSystemMetrics(filters?: SystemHealthFilters): Promise<SystemMetric[]> {
    try {
      const params = this.buildFiltersParams(filters);
      const response = await client.get(API_ENDPOINTS.ADMIN.METRICS, { params });

      // Преобразуем ответ в наш формат
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((metric: any) => ({
          id: metric.name || metric.id || `metric_${Date.now()}`,
          type: this.mapMetricType(metric.name),
          name: metric.name || "Unknown Metric",
          value: metric.value || 0,
          unit: metric.unit || "count",
          status: this.mapMetricStatus(metric.value, metric.name),
          thresholds: {
            warning: metric.warning_threshold || 75,
            critical: metric.critical_threshold || 90,
          },
          lastUpdated: new Date(),
        }));
      }

      return [];
    } catch (error) {
      console.error("Ошибка получения метрик системы:", error);
      throw new Error("Не удалось получить метрики системы");
    }
  }

  /**
   * Получить системную информацию
   * Использует API_ENDPOINTS.ADMIN.SYSTEM_INFO
   */
  async getSystemInfo(): Promise<any> {
    try {
      const response = await client.get(API_ENDPOINTS.ADMIN.SYSTEM_INFO);
      return response.data;
    } catch (error) {
      console.error("Ошибка получения системной информации:", error);
      throw new Error("Не удалось получить системную информацию");
    }
  }

  /**
   * Получить логи системы
   * Использует API_ENDPOINTS.ADMIN.LOGS
   */
  async getSystemLogs(filters?: { level?: string; limit?: number }): Promise<any[]> {
    try {
      const params = filters || {};
      const response = await client.get(API_ENDPOINTS.ADMIN.LOGS, { params });
      return response.data.logs || [];
    } catch (error) {
      console.error("Ошибка получения логов системы:", error);
      throw new Error("Не удалось получить логи системы");
    }
  }

  /**
   * Создать резервную копию
   * Использует API_ENDPOINTS.ADMIN.BACKUP
   */
  async createBackup(): Promise<{ id: string; status: string }> {
    try {
      const response = await client.post(API_ENDPOINTS.ADMIN.BACKUP);
      return response.data;
    } catch (error) {
      console.error("Ошибка создания резервной копии:", error);
      throw new Error("Не удалось создать резервную копию");
    }
  }

  /**
   * Получить список резервных копий
   * Использует API_ENDPOINTS.ADMIN.BACKUPS
   */
  async getBackups(): Promise<any[]> {
    try {
      const response = await client.get(API_ENDPOINTS.ADMIN.BACKUPS);
      return response.data.backups || [];
    } catch (error) {
      console.error("Ошибка получения списка резервных копий:", error);
      throw new Error("Не удалось получить список резервных копий");
    }
  }

  /**
   * Обновить системные настройки
   * Использует API_ENDPOINTS.ADMIN.SYSTEM_SETTINGS
   */
  async updateSystemSettings(settings: Record<string, any>): Promise<void> {
    try {
      await client.post(API_ENDPOINTS.ADMIN.SYSTEM_SETTINGS, settings);
    } catch (error) {
      console.error("Ошибка обновления системных настроек:", error);
      throw new Error("Не удалось обновить системные настройки");
    }
  }

  /**
   * Получить журнал аудита
   * Использует API_ENDPOINTS.ADMIN.AUDIT_LOG
   */
  async getAuditLog(filters?: { limit?: number; offset?: number }): Promise<any[]> {
    try {
      const params = filters || {};
      const response = await client.get(API_ENDPOINTS.ADMIN.AUDIT_LOG, { params });
      return response.data.entries || [];
    } catch (error) {
      console.error("Ошибка получения журнала аудита:", error);
      throw new Error("Не удалось получить журнал аудита");
    }
  }

  /**
   * Получить статистику пользователей
   * Использует API_ENDPOINTS.ADMIN.USERS_STATS
   */
  async getUsersStats(): Promise<any> {
    try {
      const response = await client.get(API_ENDPOINTS.ADMIN.USERS_STATS);
      return response.data;
    } catch (error) {
      console.error("Ошибка получения статистики пользователей:", error);
      throw new Error("Не удалось получить статистику пользователей");
    }
  }

  /**
   * Получить статистику проектов
   * Использует API_ENDPOINTS.ADMIN.PROJECTS_STATS
   */
  async getProjectsStats(): Promise<any> {
    try {
      const response = await client.get(API_ENDPOINTS.ADMIN.PROJECTS_STATS);
      return response.data;
    } catch (error) {
      console.error("Ошибка получения статистики проектов:", error);
      throw new Error("Не удалось получить статистику проектов");
    }
  }

  /**
   * Вспомогательные методы
   */
  private mapMetricType(name: string): MetricType {
    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("cpu")) return "cpu";
    if (lowerName.includes("memory") || lowerName.includes("ram")) return "memory";
    if (lowerName.includes("disk") || lowerName.includes("storage")) return "disk";
    if (lowerName.includes("network")) return "network";
    if (lowerName.includes("database") || lowerName.includes("db")) return "database";
    if (lowerName.includes("api")) return "api";
    if (lowerName.includes("response") || lowerName.includes("latency")) return "response_time";
    if (lowerName.includes("error")) return "error_rate";
    if (lowerName.includes("uptime")) return "uptime";
    if (lowerName.includes("user")) return "active_users";
    return "api";
  }

  private mapMetricStatus(value: number, name: string): HealthStatus {
    const type = this.mapMetricType(name);
    
    // Определяем пороги в зависимости от типа метрики
    let warningThreshold = 75;
    let criticalThreshold = 90;
    
    if (type === "response_time") {
      warningThreshold = 500; // 500ms
      criticalThreshold = 1000; // 1s
    } else if (type === "error_rate") {
      warningThreshold = 5; // 5%
      criticalThreshold = 10; // 10%
    }
    
    if (value >= criticalThreshold) return "critical";
    if (value >= warningThreshold) return "warning";
    return "healthy";
  }

  private buildFiltersParams(filters?: SystemHealthFilters): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.statuses?.length) {
      params.statuses = filters.statuses.join(",");
    }

    if (filters.metricTypes?.length) {
      params.metric_types = filters.metricTypes.join(",");
    }

    if (filters.services?.length) {
      params.services = filters.services.join(",");
    }

    if (filters.timeRange) {
      params.from = filters.timeRange.from.toISOString();
      params.to = filters.timeRange.to.toISOString();
    }

    if (filters.activeIncidentsOnly !== undefined) {
      params.active_incidents_only = filters.activeIncidentsOnly;
    }

    if (filters.minSeverity) {
      params.min_severity = filters.minSeverity;
    }

    return params;
  }
}

// Экспорт синглтона
export const systemDAO = SystemDAO.getInstance(); 