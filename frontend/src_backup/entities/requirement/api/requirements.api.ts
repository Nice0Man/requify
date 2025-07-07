import { apiClient } from "@/shared/api/client";
import type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RelationshipCreate,
  RelationshipCreateForRequirement,
  RequirementComment,
  CommentCreateForRequirement,
  TraceMatrix,
} from "../model/types";
import type { PaginatedResponse, ApiResponse } from "@/shared/types/api";

/**
 * Requirements API - слой взаимодействия с бэкендом для требований
 * В соответствии с принципами FSD, содержит только API функции без бизнес-логики
 */
export class RequirementsApi {
  private readonly baseUrl = "/requirements";

  /**
   * Поиск требований
   */
  async searchRequirements(params?: {
    project_id?: number;
    status_id?: number;
    type_id?: number;
    priority_id?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RequirementWithDetails>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/search?${searchParams}`
      : `${this.baseUrl}/search`;

    return apiClient
      .get<PaginatedResponse<RequirementWithDetails>>(url)
      .then((res) => res.data);
  }

  /**
   * Получить список требований
   */
  async getRequirements(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    status_id?: number;
    priority_id?: number;
    type_id?: number;
    assigned_to?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<PaginatedResponse<RequirementWithDetails>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}?${searchParams}`
      : this.baseUrl;

    return apiClient
      .get<PaginatedResponse<RequirementWithDetails>>(url)
      .then((res) => res.data);
  }

  /**
   * Получить требование по ID
   */
  async getRequirement(id: number): Promise<RequirementWithDetails> {
    return apiClient
      .get<RequirementWithDetails>(`${this.baseUrl}/${id}`)
      .then((res) => res.data);
  }

  /**
   * Создать новое требование
   */
  async createRequirement(data: RequirementCreate): Promise<Requirement> {
    return apiClient
      .post<Requirement>(this.baseUrl, data)
      .then((res) => res.data);
  }

  /**
   * Обновить требование
   */
  async updateRequirement(
    id: number,
    data: RequirementUpdate
  ): Promise<Requirement> {
    return apiClient
      .put<Requirement>(`${this.baseUrl}/${id}`, data)
      .then((res) => res.data);
  }

  /**
   * Удалить требование
   */
  async deleteRequirement(id: number): Promise<void> {
    return apiClient
      .delete<void>(`${this.baseUrl}/${id}`)
      .then((res) => res.data);
  }

  /**
   * Изменить статус требования
   */
  async changeRequirementStatus(
    id: number,
    data: {
      status_id: number;
      reason?: string;
    }
  ): Promise<ApiResponse<Requirement>> {
    return apiClient
      .post<ApiResponse<Requirement>>(
        `${this.baseUrl}/${id}/change-status`,
        data
      )
      .then((res) => res.data);
  }

  /**
   * Обновить прогресс требования
   */
  async updateRequirementProgress(
    id: number,
    progress: number
  ): Promise<Requirement> {
    return apiClient
      .put<Requirement>(`${this.baseUrl}/${id}/progress?progress=${progress}`)
      .then((res) => res.data);
  }

  /**
   * Получить тесты требования
   */
  async getRequirementTests(
    id: number,
    params?: {
      skip?: number;
      limit?: number;
      status?: string;
      executed_by?: number;
    }
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/tests?${searchParams}`
      : `${this.baseUrl}/${id}/tests`;

    return apiClient.get<PaginatedResponse<any>>(url).then((res) => res.data);
  }

  /**
   * Получить связи требования
   */
  async getRequirementRelationships(
    id: number
  ): Promise<RequirementRelationship[]> {
    return apiClient
      .get<RequirementRelationship[]>(`${this.baseUrl}/${id}/relationships`)
      .then((res) => res.data);
  }

  /**
   * Создать связь требования
   */
  async createRequirementRelationship(
    id: number,
    data: RelationshipCreateForRequirement
  ): Promise<RequirementRelationship> {
    return apiClient
      .post<RequirementRelationship>(
        `${this.baseUrl}/${id}/relationships`,
        data
      )
      .then((res) => res.data);
  }

  /**
   * Получить матрицу трассировки для требования
   */
  async getRequirementTraceMatrix(
    id: number,
    params?: {
      depth?: number;
      include_test_cases?: boolean;
      include_documents?: boolean;
      format?: "json" | "tree" | "matrix";
    }
  ): Promise<TraceMatrix> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/trace-matrix?${searchParams}`
      : `${this.baseUrl}/${id}/trace-matrix`;

    return apiClient.get<TraceMatrix>(url).then((res) => res.data);
  }

  /**
   * Получить комментарии требования
   */
  async getRequirementComments(
    id: number,
    params?: {
      skip?: number;
      limit?: number;
      sort_order?: "asc" | "desc";
    }
  ): Promise<PaginatedResponse<RequirementComment>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/comments?${searchParams}`
      : `${this.baseUrl}/${id}/comments`;

    return apiClient
      .get<PaginatedResponse<RequirementComment>>(url)
      .then((res) => res.data);
  }

  /**
   * Создать комментарий к требованию
   */
  async createRequirementComment(
    id: number,
    data: CommentCreateForRequirement
  ): Promise<RequirementComment> {
    return apiClient
      .post<RequirementComment>(`${this.baseUrl}/${id}/comments`, data)
      .then((res) => res.data);
  }

  /**
   * Получить статистику требований
   */
  async getRequirementsStats(params?: {
    project_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_requirements: number;
    requirements_by_status: Record<string, number>;
    requirements_by_priority: Record<string, number>;
    requirements_by_type: Record<string, number>;
    completion_rate: number;
    overdue_requirements: number;
    test_coverage: number;
    approval_rate: number;
  }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/stats?${searchParams}`
      : `${this.baseUrl}/stats`;

    return apiClient
      .get<{
        total_requirements: number;
        requirements_by_status: Record<string, number>;
        requirements_by_priority: Record<string, number>;
        requirements_by_type: Record<string, number>;
        completion_rate: number;
        overdue_requirements: number;
        test_coverage: number;
        approval_rate: number;
      }>(url)
      .then((res) => res.data);
  }

  /**
   * Экспорт требований
   */
  async exportRequirements(params?: {
    project_id?: number;
    status_ids?: number[];
    priority_ids?: number[];
    type_ids?: number[];
    format?: "excel" | "csv" | "pdf" | "word";
    include_comments?: boolean;
    include_relationships?: boolean;
    include_test_results?: boolean;
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/export?${searchParams}`
      : `${this.baseUrl}/export`;

    return apiClient.get<Blob>(url).then((res) => res.data);
  }

  /**
   * Импорт требований
   */
  async importRequirements(
    file: File,
    params?: {
      project_id: number;
      update_existing?: boolean;
      create_missing_references?: boolean;
    }
  ): Promise<{
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
      row: number;
      error: string;
      data?: any;
    }>;
    created_requirements: number[];
    updated_requirements: number[];
  }> {
    const formData = new FormData();
    formData.append("file", file);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return apiClient
      .post<{
        total_processed: number;
        successful_imports: number;
        failed_imports: number;
        errors: Array<{
          row: number;
          error: string;
          data?: any;
        }>;
        created_requirements: number[];
        updated_requirements: number[];
      }>(`${this.baseUrl}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  /**
   * Клонировать требование
   */
  async cloneRequirement(
    id: number,
    data: {
      title?: string;
      target_project_id?: number;
      copy_relationships?: boolean;
      copy_comments?: boolean;
      copy_test_cases?: boolean;
    }
  ): Promise<Requirement> {
    return apiClient
      .post<Requirement>(`${this.baseUrl}/${id}/clone`, data)
      .then((res) => res.data);
  }

  /**
   * Массовое обновление требований
   */
  async bulkUpdateRequirements(data: {
    requirement_ids: number[];
    updates: {
      status_id?: number;
      priority_id?: number;
      type_id?: number;
      assigned_to?: number;
      release_id?: number;
    };
    reason?: string;
  }): Promise<
    ApiResponse<{
      updated: number;
      failed: number;
      errors: Array<{
        requirement_id: number;
        error: string;
      }>;
    }>
  > {
    return apiClient
      .post<ApiResponse<any>>(`${this.baseUrl}/bulk-update`, data)
      .then((res) => res.data);
  }

  /**
   * Архивировать требование
   */
  async archiveRequirement(
    id: number,
    reason?: string
  ): Promise<ApiResponse<Requirement>> {
    return apiClient
      .post<ApiResponse<Requirement>>(`${this.baseUrl}/${id}/archive`, {
        reason,
      })
      .then((res) => res.data);
  }

  /**
   * Восстановить требование из архива
   */
  async restoreRequirement(id: number): Promise<ApiResponse<Requirement>> {
    return apiClient
      .post<ApiResponse<Requirement>>(`${this.baseUrl}/${id}/restore`)
      .then((res) => res.data);
  }
}

// Экспортируем экземпляр API для использования в приложении
export const requirementsApi = new RequirementsApi();
