import { apiClient } from "@/shared/api/client";
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectState,
} from "../model/projects.types";
import type { PaginatedResponse, ApiResponse } from "@/shared/types/api";

/**
 * Project API - слой взаимодействия с бэкендом для проектов
 * В соответствии с принципами FSD, содержит только API функции без бизнес-логики
 */
export class ProjectsApi {
  private readonly baseUrl = "/projects";

  /**
   * Получить список проектов
   */
  async getProjects(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: ProjectState;
    owner_id?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<PaginatedResponse<Project>> {
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
      .get<PaginatedResponse<Project>>(url)
      .then((response) => response.data);
  }

  /**
   * Получить проект по ID
   */
  async getProject(id: number): Promise<Project> {
    return apiClient.get<Project>(`${this.baseUrl}/${id}`)
      .then((response) => response.data);
  }

  /**
   * Создать новый проект
   */
  async createProject(data: ProjectCreate): Promise<Project> {
    return apiClient.post<Project>(this.baseUrl, data)
      .then((response) => response.data);
  }

  /**
   * Обновить проект
   */
  async updateProject(id: number, data: ProjectUpdate): Promise<Project> {
    return apiClient.put<Project>(`${this.baseUrl}/${id}`, data)
      .then((response) => response.data);
  }

  /**
   * Удалить проект
   */
  async deleteProject(id: number): Promise<void> {
    return apiClient
      .delete<void>(`${this.baseUrl}/${id}`)
      .then((response) => response.data);
  }

  /**
   * Получить требования проекта
   */
  async getProjectRequirements(
    id: number,
    params?: {
      skip?: number;
      limit?: number;
      status_id?: number;
      priority_id?: number;
      type_id?: number;
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
      ? `${this.baseUrl}/${id}/requirements?${searchParams}`
      : `${this.baseUrl}/${id}/requirements`;

    return apiClient
      .get<PaginatedResponse<any>>(url)
      .then((response) => response.data);
  }

  /**
   * Синхронизировать требования проекта с релизом
   */
  async syncProjectToRelease(id: number): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      `${this.baseUrl}/${id}/sync-to-release`
    );
  }

  /**
   * Получить релизы проекта
   */
  async getProjectReleases(
    id: number,
    params?: {
      skip?: number;
      limit?: number;
      status?: ProjectState;
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
      ? `${this.baseUrl}/${id}/releases?${searchParams}`
      : `${this.baseUrl}/${id}/releases`;

    return apiClient
      .get<PaginatedResponse<any>>(url)
      .then((response) => response.data);
  }

  /**
   * Получить статистику проекта
   */
  async getProjectStats(id: number): Promise<ProjectWithStats> {
    return apiClient
      .get<ProjectWithStats>(`${this.baseUrl}/${id}/stats`)
      .then((response) => response.data);
  }

  /**
   * Получить статистику всех проектов
   */
  async getAllProjectsStats(): Promise<{
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    archived_projects: number;
    total_requirements: number;
    total_releases: number;
  }> {
    return apiClient
      .get<{
        total_projects: number;
        active_projects: number;
        completed_projects: number;
        archived_projects: number;
        total_requirements: number;
        total_releases: number;
      }>(`${this.baseUrl}/stats`)
      .then((response) => response.data);
  }

  /**
   * Поиск проектов
   */
  async searchProjects(
    query: string,
    filters?: {
      status?: ProjectState[];
      owner_id?: number;
      created_from?: string;
      created_to?: string;
    }
  ): Promise<Project[]> {
    const searchParams = new URLSearchParams();
    searchParams.append("search", query);

    if (filters) {
      if (filters.status?.length) {
        filters.status.forEach((status) =>
          searchParams.append("status", String(status))
        );
      }
      if (filters.owner_id) {
        searchParams.append("owner_id", String(filters.owner_id));
      }
      if (filters.created_from) {
        searchParams.append("created_from", filters.created_from);
      }
      if (filters.created_to) {
        searchParams.append("created_to", filters.created_to);
      }
    }

    return apiClient
      .get<Project[]>(`${this.baseUrl}/search?${searchParams}`)
      .then((response) => response.data);
  }

  /**
   * Экспорт проекта
   */
  async exportProject(
    id: number,
    format: "excel" | "csv" | "pdf" = "excel"
  ): Promise<Blob> {
    return apiClient
      .get<Blob>(`${this.baseUrl}/${id}/export?format=${format}`)
      .then((response) => response.data);
  }

  /**
   * Импорт проектов
   */
  async importProjects(file: File): Promise<{
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
      row: number;
      error: string;
      data?: any;
    }>;
  }> {
    const formData = new FormData();
    formData.append("file", file);

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
      }>(`${this.baseUrl}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  }
}

// Экспортируем экземпляр API для использования в приложении
export const projectsApi = new ProjectsApi();
