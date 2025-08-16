/**
 * Trace Matrix Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/trace_matrix.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  TraceMatrix,
  TraceMatrixConfig,
  TraceMatrixStatistics,
  TraceMatrixExport,
  TraceMatrixVisualization,
  TraceAnalysis,
  TraceMatrixResponse,
  TraceMatrixListResponse,
  TraceAnalysisResponse,
  TraceMatrixQueryParams,
  TraceAnalysisQueryParams,
  TraceMatrixGenerationRequest,
  TraceMatrixExportRequest,
} from "../model/types";

/**
 * TraceMatrixDAO - класс для работы с API матрицы трассируемости
 */
export class TraceMatrixDAO {
  private static instance: TraceMatrixDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): TraceMatrixDAO {
    if (!TraceMatrixDAO.instance) {
      TraceMatrixDAO.instance = new TraceMatrixDAO();
    }
    return TraceMatrixDAO.instance;
  }

  // === Основные операции с матрицей трассируемости ===

  /**
   * Получить матрицу трассируемости для проекта
   */
  async getProjectTraceMatrix(projectId: string, params?: TraceMatrixQueryParams): Promise<TraceMatrix> {
    try {
      const response = await client.get<TraceMatrixResponse>(
        API_ENDPOINTS.TRACE_MATRIX.GET(projectId),
        { params }
      );
      return response.data.trace_matrix;
    } catch (error) {
      console.error(`Failed to get trace matrix for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить матрицу трассируемости для требования
   */
  async getRequirementTraceMatrix(
    requirementId: string,
    params?: TraceMatrixQueryParams
  ): Promise<TraceMatrix> {
    try {
      const response = await client.get<TraceMatrixResponse>(
        API_ENDPOINTS.TRACE_MATRIX.BY_REQUIREMENT(requirementId),
        { params }
      );
      return response.data.trace_matrix;
    } catch (error) {
      console.error(`Failed to get trace matrix for requirement ${requirementId}:`, error);
      throw error;
    }
  }

  /**
   * Сгенерировать новую матрицу трассируемости
   */
  async generateTraceMatrix(request: TraceMatrixGenerationRequest): Promise<TraceMatrix> {
    try {
      const response = await client.post<TraceMatrixResponse>(
        API_ENDPOINTS.TRACE_MATRIX.GENERATE(request.project_id?.toString() || ''),
        request
      );
      return response.data.trace_matrix;
    } catch (error) {
      console.error("Failed to generate trace matrix:", error);
      throw error;
    }
  }

  /**
   * Обновить конфигурацию матрицы трассируемости
   */
  async updateTraceMatrixConfig(
    projectId: string,
    config: TraceMatrixConfig
  ): Promise<TraceMatrix> {
    try {
      const response = await client.put<TraceMatrixResponse>(
        API_ENDPOINTS.TRACE_MATRIX.GET(projectId),
        { config }
      );
      return response.data.trace_matrix;
    } catch (error) {
      console.error(`Failed to update trace matrix config for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Анализ и статистика ===

  /**
   * Получить анализ трассируемости
   */
  async getTraceAnalysis(
    projectId: string,
    params?: TraceAnalysisQueryParams
  ): Promise<TraceAnalysis> {
    try {
      const response = await client.get<TraceAnalysisResponse>(
        `/projects/${projectId}/trace-analysis`,
        { params }
      );
      return response.data.analysis;
    } catch (error) {
      console.error(`Failed to get trace analysis for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить покрытие трассируемости
   */
  async getTraceCoverage(projectId: string): Promise<any> {
    try {
      const response = await client.get(
        API_ENDPOINTS.TRACE_MATRIX.COVERAGE(projectId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get trace coverage for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить статистику матрицы трассируемости
   */
  async getTraceMatrixStatistics(projectId: string): Promise<TraceMatrixStatistics> {
    try {
      const response = await client.get<{ statistics: TraceMatrixStatistics }>(
        `/projects/${projectId}/trace-matrix/statistics`
      );
      return response.data.statistics;
    } catch (error) {
      console.error(`Failed to get trace matrix statistics for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Экспорт и визуализация ===

  /**
   * Экспортировать матрицу трассируемости
   */
  async exportTraceMatrix(
    projectId: string,
    request: TraceMatrixExportRequest
  ): Promise<TraceMatrixExport> {
    try {
      const response = await client.post<TraceMatrixExport>(
        API_ENDPOINTS.TRACE_MATRIX.EXPORT(projectId),
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to export trace matrix for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Скачать экспортированную матрицу
   */
  async downloadTraceMatrixExport(exportId: string): Promise<Blob> {
    try {
      const response = await client.get(`/trace-matrix/exports/${exportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download trace matrix export ${exportId}:`, error);
      throw error;
    }
  }

  /**
   * Получить данные для визуализации
   */
  async getVisualizationData(
    projectId: string,
    type: 'tree' | 'graph' | 'table' | 'sankey' = 'graph'
  ): Promise<TraceMatrixVisualization> {
    try {
      const response = await client.get<TraceMatrixVisualization>(
        `/projects/${projectId}/trace-matrix/visualization`,
        {
          params: { type }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get visualization data for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Управление связями ===

  /**
   * Добавить связь между требованиями
   */
  async addRequirementLink(
    sourceId: string,
    targetId: string,
    relationshipType: string,
    strength: number = 1.0
  ): Promise<void> {
    try {
      await client.post('/requirement-links', {
        source_id: parseInt(sourceId),
        target_id: parseInt(targetId),
        relationship_type: relationshipType,
        strength,
      });
    } catch (error) {
      console.error(`Failed to add link between ${sourceId} and ${targetId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить связь между требованиями
   */
  async removeRequirementLink(sourceId: string, targetId: string): Promise<void> {
    try {
      await client.delete(`/requirement-links/${sourceId}/${targetId}`);
    } catch (error) {
      console.error(`Failed to remove link between ${sourceId} and ${targetId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить связь между требованиями
   */
  async updateRequirementLink(
    sourceId: string,
    targetId: string,
    updates: {
      relationship_type?: string;
      strength?: number;
    }
  ): Promise<void> {
    try {
      await client.put(`/requirement-links/${sourceId}/${targetId}`, updates);
    } catch (error) {
      console.error(`Failed to update link between ${sourceId} and ${targetId}:`, error);
      throw error;
    }
  }

  // === Поиск и фильтрация ===

  /**
   * Поиск требований в матрице трассируемости
   */
  async searchRequirementsInMatrix(
    projectId: string,
    query: string,
    filters?: {
      types?: string[];
      levels?: number[];
      connected_only?: boolean;
    }
  ): Promise<any[]> {
    try {
      const response = await client.get(`/projects/${projectId}/trace-matrix/search`, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to search requirements in trace matrix for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить предложения для создания связей
   */
  async getSuggestedLinks(
    projectId: string,
    requirementId?: string
  ): Promise<{
    suggestions: Array<{
      source_id: number;
      target_id: number;
      relationship_type: string;
      confidence: number;
      reason: string;
    }>;
  }> {
    try {
      const params = requirementId ? { requirement_id: requirementId } : {};
      const response = await client.get(`/projects/${projectId}/trace-matrix/suggestions`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get suggested links for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Валидация и проверка качества ===

  /**
   * Валидировать матрицу трассируемости
   */
  async validateTraceMatrix(projectId: string): Promise<{
    is_valid: boolean;
    errors: Array<{
      type: string;
      message: string;
      requirement_ids: number[];
      severity: 'warning' | 'error' | 'info';
    }>;
    warnings: Array<{
      type: string;
      message: string;
      requirement_ids: number[];
    }>;
  }> {
    try {
      const response = await client.post(`/projects/${projectId}/trace-matrix/validate`);
      return response.data;
    } catch (error) {
      console.error(`Failed to validate trace matrix for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Проверить циклические зависимости
   */
  async checkCircularDependencies(projectId: string): Promise<{
    has_cycles: boolean;
    cycles: Array<{
      path: number[];
      severity: 'warning' | 'error';
      description: string;
    }>;
  }> {
    try {
      const response = await client.get(`/projects/${projectId}/trace-matrix/cycles`);
      return response.data;
    } catch (error) {
      console.error(`Failed to check circular dependencies for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Кэширование и оптимизация ===

  /**
   * Очистить кэш матрицы трассируемости
   */
  async clearTraceMatrixCache(projectId: string): Promise<void> {
    try {
      await client.delete(`/projects/${projectId}/trace-matrix/cache`);
    } catch (error) {
      console.error(`Failed to clear trace matrix cache for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить кэш матрицы трассируемости
   */
  async refreshTraceMatrixCache(projectId: string): Promise<void> {
    try {
      await client.post(`/projects/${projectId}/trace-matrix/cache/refresh`);
    } catch (error) {
      console.error(`Failed to refresh trace matrix cache for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Импорт и миграция ===

  /**
   * Импортировать связи требований из файла
   */
  async importRequirementLinks(
    projectId: string,
    file: File,
    format: 'csv' | 'excel' | 'json' = 'csv'
  ): Promise<{
    imported_count: number;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);

      const response = await client.post(
        `/projects/${projectId}/trace-matrix/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to import requirement links for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Мониторинг изменений ===

  /**
   * Подписаться на обновления матрицы трассируемости
   */
  subscribeToUpdates(
    projectId: string,
    callback: (update: any) => void
  ): () => void {
    // TODO: Реализовать WebSocket подключение
    console.log(`Subscribing to trace matrix updates for project ${projectId}`);
    
    // Заглушка для отписки
    return () => {
      console.log(`Unsubscribing from trace matrix updates for project ${projectId}`);
    };
  }
}

// Экспорт singleton instance
export const traceMatrixDAO = TraceMatrixDAO.getInstance();