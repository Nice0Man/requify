/**
 * Report Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/report.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Report,
  ReportCreate,
  ReportUpdate,
  ReportWithDetails,
  ReportTemplate,
  ReportTemplateCreate,
  ReportTemplateUpdate,
  ReportGenerationRequest,
  ReportGenerationJob,
  ReportShare,
  ReportShareCreate,
  ReportSchedule,
  ReportScheduleCreate,
  ReportAnalytics,
  ReportListResponse,
  ReportDetailResponse,
  ReportTemplateListResponse,
  ReportAnalyticsResponse,
  ReportQueryParams,
  ReportTemplateQueryParams,
  ReportBulkOperation,
} from "../model/types";

/**
 * ReportDAO - класс для работы с API отчетов
 */
export class ReportDAO {
  private static instance: ReportDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): ReportDAO {
    if (!ReportDAO.instance) {
      ReportDAO.instance = new ReportDAO();
    }
    return ReportDAO.instance;
  }

  // === CRUD операции с отчетами ===

  /**
   * Получить список отчетов
   */
  async getReports(params?: ReportQueryParams): Promise<ReportListResponse> {
    try {
      const response = await client.get<ReportListResponse>(
        API_ENDPOINTS.REPORTS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get reports:", error);
      throw error;
    }
  }

  /**
   * Получить отчет по ID
   */
  async getReportById(id: string): Promise<ReportDetailResponse> {
    try {
      const response = await client.get<ReportDetailResponse>(
        API_ENDPOINTS.REPORTS.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый отчет
   */
  async createReport(data: ReportCreate): Promise<Report> {
    try {
      const response = await client.post<Report>(
        API_ENDPOINTS.REPORTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create report:", error);
      throw error;
    }
  }

  /**
   * Обновить отчет
   */
  async updateReport(id: string, data: ReportUpdate): Promise<Report> {
    try {
      const response = await client.put<Report>(
        API_ENDPOINTS.REPORTS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить отчет
   */
  async deleteReport(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.REPORTS.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete report ${id}:`, error);
      throw error;
    }
  }

  // === Генерация отчетов ===

  /**
   * Сгенерировать отчет
   */
  async generateReport(
    request: ReportGenerationRequest
  ): Promise<ReportGenerationJob> {
    try {
      const response = await client.post<ReportGenerationJob>(
        API_ENDPOINTS.REPORTS.GENERATE(""),
        request
      );
      return response.data;
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }

  /**
   * Получить статус генерации отчета
   */
  async getGenerationStatus(jobId: string): Promise<ReportGenerationJob> {
    try {
      const response = await client.get<ReportGenerationJob>(
        `/reports/generation/${jobId}/status`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get generation status ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Отменить генерацию отчета
   */
  async cancelGeneration(jobId: string): Promise<void> {
    try {
      await client.post(`/reports/generation/${jobId}/cancel`);
    } catch (error) {
      console.error(`Failed to cancel generation ${jobId}:`, error);
      throw error;
    }
  }

  // === Скачивание отчетов ===

  /**
   * Скачать отчет
   */
  async downloadReport(id: string): Promise<Blob> {
    try {
      const response = await client.get(API_ENDPOINTS.REPORTS.DOWNLOAD(id), {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить URL для скачивания
   */
  async getDownloadUrl(
    id: string
  ): Promise<{ download_url: string; expires_at: string }> {
    try {
      const response = await client.get<{
        download_url: string;
        expires_at: string;
      }>(`/reports/${id}/download-url`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get download URL for report ${id}:`, error);
      throw error;
    }
  }

  // === Отчеты по проектам ===

  /**
   * Получить отчеты по проекту
   */
  async getProjectReports(projectId: string): Promise<Report[]> {
    try {
      const response = await client.get<Report[]>(
        API_ENDPOINTS.REPORTS.PROJECT_REPORTS(projectId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get project reports ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить отчеты по требованию
   */
  async getRequirementReports(requirementId: string): Promise<Report[]> {
    try {
      const response = await client.get<Report[]>(
        API_ENDPOINTS.REPORTS.REQUIREMENT_REPORTS(requirementId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to get requirement reports ${requirementId}:`,
        error
      );
      throw error;
    }
  }

  // === Шаблоны отчетов ===

  /**
   * Получить список шаблонов отчетов
   */
  async getReportTemplates(
    params?: ReportTemplateQueryParams
  ): Promise<ReportTemplateListResponse> {
    try {
      const response = await client.get<ReportTemplateListResponse>(
        API_ENDPOINTS.REPORTS.TEMPLATES,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get report templates:", error);
      throw error;
    }
  }

  /**
   * Получить шаблон отчета по ID
   */
  async getReportTemplateById(id: string): Promise<ReportTemplate> {
    try {
      const response = await client.get<ReportTemplate>(
        `/report-templates/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get report template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать шаблон отчета
   */
  async createReportTemplate(
    data: ReportTemplateCreate
  ): Promise<ReportTemplate> {
    try {
      const response = await client.post<ReportTemplate>(
        "/report-templates",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create report template:", error);
      throw error;
    }
  }

  /**
   * Обновить шаблон отчета
   */
  async updateReportTemplate(
    id: string,
    data: ReportTemplateUpdate
  ): Promise<ReportTemplate> {
    try {
      const response = await client.put<ReportTemplate>(
        `/report-templates/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update report template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить шаблон отчета
   */
  async deleteReportTemplate(id: string): Promise<void> {
    try {
      await client.delete(`/report-templates/${id}`);
    } catch (error) {
      console.error(`Failed to delete report template ${id}:`, error);
      throw error;
    }
  }

  // === Расшаривание отчетов ===

  /**
   * Создать ссылку для расшаривания отчета
   */
  async shareReport(data: ReportShareCreate): Promise<ReportShare> {
    try {
      const response = await client.post<ReportShare>("/report-shares", data);
      return response.data;
    } catch (error) {
      console.error("Failed to share report:", error);
      throw error;
    }
  }

  /**
   * Получить информацию о расшаренном отчете
   */
  async getSharedReport(token: string): Promise<ReportShare> {
    try {
      const response = await client.get<ReportShare>(`/report-shares/${token}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get shared report ${token}:`, error);
      throw error;
    }
  }

  /**
   * Отозвать расшаривание отчета
   */
  async revokeReportShare(shareId: string): Promise<void> {
    try {
      await client.delete(`/report-shares/${shareId}`);
    } catch (error) {
      console.error(`Failed to revoke report share ${shareId}:`, error);
      throw error;
    }
  }

  // === Планирование отчетов ===

  /**
   * Создать расписание для отчета
   */
  async createReportSchedule(
    data: ReportScheduleCreate
  ): Promise<ReportSchedule> {
    try {
      const response = await client.post<ReportSchedule>(
        "/report-schedules",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create report schedule:", error);
      throw error;
    }
  }

  /**
   * Получить расписания отчетов
   */
  async getReportSchedules(): Promise<ReportSchedule[]> {
    try {
      const response = await client.get<ReportSchedule[]>("/report-schedules");
      return response.data;
    } catch (error) {
      console.error("Failed to get report schedules:", error);
      throw error;
    }
  }

  /**
   * Активировать/деактивировать расписание
   */
  async toggleReportSchedule(
    id: string,
    isActive: boolean
  ): Promise<ReportSchedule> {
    try {
      const response = await client.patch<ReportSchedule>(
        `/report-schedules/${id}`,
        {
          is_active: isActive,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle report schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить расписание отчета
   */
  async deleteReportSchedule(id: string): Promise<void> {
    try {
      await client.delete(`/report-schedules/${id}`);
    } catch (error) {
      console.error(`Failed to delete report schedule ${id}:`, error);
      throw error;
    }
  }

  // === Bulk операции ===

  /**
   * Выполнить массовую операцию над отчетами
   */
  async bulkOperation(
    operation: ReportBulkOperation
  ): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/reports/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk report operation:", error);
      throw error;
    }
  }

  // === Аналитика ===

  /**
   * Получить аналитику отчетов
   */
  async getReportAnalytics(params?: {
    date_from?: string;
    date_to?: string;
    project_id?: number;
  }): Promise<ReportAnalyticsResponse> {
    try {
      const response = await client.get<ReportAnalyticsResponse>(
        "/reports/analytics",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get report analytics:", error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск отчетов
   */
  async searchReports(
    query: string,
    filters?: Partial<ReportQueryParams>
  ): Promise<Report[]> {
    try {
      const response = await client.get<Report[]>("/reports/search", {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search reports:", error);
      throw error;
    }
  }

  // === Экспорт ===

  /**
   * Экспортировать список отчетов
   */
  async exportReports(
    format: "csv" | "xlsx",
    filters?: Partial<ReportQueryParams>
  ): Promise<Blob> {
    try {
      const response = await client.get("/reports/export", {
        params: {
          format,
          ...filters,
        },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to export reports:", error);
      throw error;
    }
  }

  // === Валидация ===

  /**
   * Валидировать конфигурацию отчета
   */
  async validateReportConfig(config: any): Promise<{
    is_valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await client.post<{
        is_valid: boolean;
        errors: string[];
        warnings: string[];
      }>("/reports/validate-config", { config });
      return response.data;
    } catch (error) {
      console.error("Failed to validate report config:", error);
      throw error;
    }
  }

  // === Предварительный просмотр ===

  /**
   * Получить предварительный просмотр отчета
   */
  async getReportPreview(config: any): Promise<{
    preview_html: string;
    estimated_pages: number;
    estimated_size: number;
  }> {
    try {
      const response = await client.post<{
        preview_html: string;
        estimated_pages: number;
        estimated_size: number;
      }>("/reports/preview", { config });
      return response.data;
    } catch (error) {
      console.error("Failed to get report preview:", error);
      throw error;
    }
  }

  // === Мониторинг ===

  /**
   * Подписаться на обновления статуса генерации
   */
  subscribeToGenerationUpdates(
    jobId: string,
    callback: (job: ReportGenerationJob) => void
  ): () => void {
    // TODO: Реализовать WebSocket подключение
    console.log(`Subscribing to generation updates for job ${jobId}`);

    // Заглушка для отписки
    return () => {
      console.warn(`Unsubscribing from generation updates for job ${jobId}`);
    };
  } 
}

// Экспорт singleton instance
export const reportDAO = ReportDAO.getInstance();
