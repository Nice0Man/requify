import { apiClient } from "@/shared/api/client";
import type {
  Release,
  ReleaseCreate,
  ReleaseUpdate,
  ReleaseWithStats,
  ReleaseCreateFromRequirements,
  ReleaseSpecification,
  ReleaseChangelog,
  ReleaseRequirement,
} from "../model/release.types";
import type { PaginatedResponse, ApiResponse } from "@/shared/types/api";

/**
 * Release API - слой взаимодействия с бэкендом для релизов
 * В соответствии с принципами FSD, содержит только API функции без бизнес-логики
 */
export class ReleasesApi {
  private readonly baseUrl = "/api/v1/releases";

  /**
   * Получить список релизов
   */
  async getReleases(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<PaginatedResponse<Release>> {
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
      .get<PaginatedResponse<Release>>(url)
      .then((res) => res.data);
  }

  /**
   * Получить релиз по ID
   */
  async getRelease(id: number): Promise<Release> {
    return apiClient
      .get<Release>(`${this.baseUrl}/${id}`)
      .then((res) => res.data);
  }

  /**
   * Создать новый релиз
   */
  async createRelease(data: ReleaseCreate): Promise<Release> {
    return apiClient
      .post<Release>(this.baseUrl, data)
      .then((res) => res.data);
  }

  /**
   * Обновить релиз
   */
  async updateRelease(id: number, data: ReleaseUpdate): Promise<Release> {
    return apiClient
      .put<Release>(`${this.baseUrl}/${id}`, data)
      .then((res) => res.data);
  }

  /**
   * Удалить релиз
   */
  async deleteRelease(id: number): Promise<void> {
    return apiClient
      .delete<void>(`${this.baseUrl}/${id}`)
      .then((res) => res.data);
  }

  /**
   * Создать релиз из требований
   */
  async createReleaseFromRequirements(
    data: ReleaseCreateFromRequirements
  ): Promise<Release> {
    return apiClient.post<Release>(
      `${this.baseUrl}/create-from-requirements`,
      data
    ).then((res) => res.data);
  }

  /**
   * Сгенерировать спецификацию релиза
   */
  async generateReleaseSpecification(
    id: number,
    params?: {
      include_requirements?: boolean;
      include_test_cases?: boolean;
      format?: "json" | "html" | "pdf";
    }
  ): Promise<ReleaseSpecification> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/generate-specification?${searchParams}`
      : `${this.baseUrl}/${id}/generate-specification`;

    return apiClient.post<ReleaseSpecification>(url).then((res) => res.data);
  }

  /**
   * Опубликовать релиз
   */
  async publishRelease(
    id: number,
    data?: {
      notes?: string;
      notification_channels?: string[];
      auto_deploy?: boolean;
    }
  ): Promise<ApiResponse<Release>> {
    return apiClient.post<ApiResponse<Release>>(
      `${this.baseUrl}/${id}/publish`,
      data || {}
    ).then((res) => res.data);
  }

  /**
   * Получить требования релиза
   */
  async getReleaseRequirements(
    id: number,
    params?: {
      skip?: number;
      limit?: number;
      status?: string;
      priority?: string;
    }
  ): Promise<PaginatedResponse<ReleaseRequirement>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/requirements?${searchParams}`
      : `${this.baseUrl}/${id}/requirements`;

    return apiClient
      .get<PaginatedResponse<ReleaseRequirement>>(url)
        .then((res) => res.data);
  }

  /**
   * Получить changelog релиза
   */
  async getReleaseChangelog(
    id: number,
    params?: {
      format?: "json" | "markdown" | "html";
      include_requirements?: boolean;
      group_by?: "type" | "priority" | "component";
    }
  ): Promise<ReleaseChangelog> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/${id}/changelog?${searchParams}`
      : `${this.baseUrl}/${id}/changelog`;

    return apiClient.get<ReleaseChangelog>(url).then((res) => res.data);
  }

  /**
   * Синхронизировать требования проекта с релизом
   */
  async syncProjectRequirementsToRelease(
    id: number,
    data: {
      project_id: number;
      requirement_ids?: number[];
      sync_mode?: "add" | "replace" | "remove";
      auto_update_status?: boolean;
    }
  ): Promise<
    ApiResponse<{
      added: number;
      updated: number;
      removed: number;
      errors: string[];
    }>
  > {
    return apiClient
      .post<
        ApiResponse<{
          added: number;
          updated: number;
          removed: number;
          errors: string[];
        }>
      >(`${this.baseUrl}/${id}/sync-project-requirements`, data)
      .then((res) => res.data);
  }

  /**
   * Получить статистику релиза
   */
  async getReleaseStats(id: number): Promise<ReleaseWithStats> {
    return apiClient.get<ReleaseWithStats>(`${this.baseUrl}/${id}/stats`).then((res) => res.data);
  }

  /**
   * Получить статистику всех релизов
   */
  async getAllReleasesStats(params?: {
    project_id?: number;
    status?: string[];
    date_from?: string;
    date_to?: string;
  }): Promise<{
    releases_by_type: {};
    active_releases: number;
    completed_releases: number;
    cancelled_releases: number;
    total_releases: number;
    releases_by_status: Record<string, number>;
    average_requirements_per_release: number;
    average_development_time: number;
    success_rate: number;
    upcoming_releases: number;
  }> {
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
      ? `${this.baseUrl}/stats?${searchParams}`
      : `${this.baseUrl}/stats`;

    return apiClient
      .get<{
        total_releases: number;
        releases_by_status: Record<string, number>;
        average_requirements_per_release: number;
        average_development_time: number;
        success_rate: number;
        upcoming_releases: number;
      }>(url)
      .then((res) => res.data);
  }

  /**
   * Поиск релизов
   */
  async searchReleases(
    query: string,
    filters?: {
      project_id?: number;
      status?: string[];
      created_from?: string;
      created_to?: string;
      release_date_from?: string;
      release_date_to?: string;
    }
  ): Promise<Release[]> {
    const searchParams = new URLSearchParams();
    searchParams.append("search", query);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return apiClient
      .get<Release[]>(`${this.baseUrl}/search?${searchParams}`)
      .then((res) => res.data);
  }

  /**
   * Экспорт релиза
   */
  async exportRelease(
    id: number,
    format: "excel" | "csv" | "pdf" = "excel"
  ): Promise<Blob> {
    return apiClient
      .get<Blob>(`${this.baseUrl}/${id}/export?format=${format}`)
      .then((res) => res.data);
  }

  /**
   * Клонировать релиз
   */
  async cloneRelease(
    id: number,
    data: {
      name: string;
      version: string;
      copy_requirements?: boolean;
      copy_specifications?: boolean;
      target_project_id?: number;
    }
  ): Promise<Release> {
    return apiClient.post<Release>(`${this.baseUrl}/${id}/clone`, data).then((res) => res.data);
  }

  /**
   * Архивировать релиз
   */
  async archiveRelease(
    id: number,
    reason?: string
  ): Promise<ApiResponse<Release>> {
    return apiClient.post<ApiResponse<Release>>(
      `${this.baseUrl}/${id}/archive`,
      { reason }
    ).then((res) => res.data);
  }

  /**
   * Восстановить релиз из архива
   */
  async restoreRelease(id: number): Promise<ApiResponse<Release>> {
    return apiClient.post<ApiResponse<Release>>(
      `${this.baseUrl}/${id}/restore`
    ).then((res) => res.data) ;
  }
}

// Экспортируем экземпляр API для использования в приложении
export const releasesApi = new ReleasesApi();
