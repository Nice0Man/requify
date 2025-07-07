import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/client";
import type { UserProfile } from "@/entities/user";



export interface ProjectBase {
  code: string; 
  name: string;
  description?: string;
  status: string;
}

export interface Project extends ProjectBase {
  id: number;
  owner_id: number;
  created_at: string;
  // Extended fields for UI compatibility
  updated_at?: string;
  owner_name?: string;
  specs_count?: number;
  // Убраны поля которых нет в бэкенде: manager_id, team_lead_id, client_id, start_date, end_date, tags, is_active
}

export interface ProjectCreate {
  code: string; // Добавлено: обязательное поле из бэкенда
  name: string;
  description?: string;
  status?: string;
  // Убраны поля которых нет в бэкенде: manager_id, team_lead_id, client_id, start_date, end_date, tags
}

export interface ProjectUpdate {
  code?: string; // Добавлено: обязательное поле из бэкенда
  name?: string;
  description?: string;
  status?: string;
  // Убраны поля которых нет в бэкенде: manager_id, team_lead_id, client_id, start_date, end_date, tags, is_active
}

// Расширенная версия с статистикой (соответствует ProjectWithStats в бэкенде)
export interface ProjectWithStats extends Project {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
  
  // UI расширения (не в бэкенде)
  requirements_in_progress?: number;
  requirements_pending?: number;
  total_releases?: number;
  completed_releases?: number;
  team_members_count?: number;
  last_activity?: string;
}

// =============================================================================
// Related Types (Requirements, Releases)
// =============================================================================

// Типы для требований проекта
export interface Requirement {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  type_id: number; // Как в бэкенде - ID типа, а не строка
  priority_id: number; // Как в бэкенде - ID приоритета, а не строка  
  status_id: number; // Как в бэкенде - ID статуса, а не строка
  author_id: number;
  last_modified_by: number;
  release_id?: number;
  spec_id?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

// Типы для релизов проекта  
export interface Release {
  id: number;
  project_id: number;
  name: string;
  version: string;
  description?: string;
  status: string;
  planned_date?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Response Types
// =============================================================================

// Статистика проекта (соответствует бэкенду)
export interface ProjectStats {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
  
  // Дополнительная статистика для UI
  requirements_by_status: Record<string, number>;
  requirements_by_type: Record<string, number>;
  requirements_by_priority: Record<string, number>;
  total_releases: number;
  releases_by_status: Record<string, number>;
  completion_percentage: number;
  average_completion_time?: number;
  last_activity?: string;
}

// Фильтры для получения проектов
export interface ProjectFilters {
  search?: string;
  status?: string[];
  owner_id?: number; // Изменено с manager_id на owner_id как в бэкенде
  created_from?: string;
  created_to?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
  // Убраны: manager_id, team_lead_id, client_id, tags
}

// Ответ для списка проектов
export interface ProjectsResponse {
  items: Project[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Ответ для списка с расширенной статистикой
export interface ProjectsWithStatsResponse {
  items: ProjectWithStats[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =============================================================================
// Project API Class
// =============================================================================

export class ProjectApi {
  private readonly baseUrl = "/projects";

  /**
   * Получить список проектов
   * GET /api/v1/projects/
   */
  async getProjects(filters?: ProjectFilters): Promise<ProjectsResponse> {
    return apiClient
      .get<ProjectsResponse>(this.baseUrl, {
        params: filters,
      })
      .then((res) => res.data);
  }

  /**
   * Создать новый проект
   * POST /api/v1/projects/
   */
  async createProject(data: ProjectCreate): Promise<Project> {
    return apiClient.post<Project>(this.baseUrl, data).then((res) => res.data);
  }

  /**
   * Получить проект по ID
   * GET /api/v1/projects/{project_id}
   */
  async getProject(projectId: number): Promise<Project> {
    return apiClient
      .get<Project>(`${this.baseUrl}/${projectId}`)
      .then((res) => res.data);
  }

  /**
   * Обновить проект
   * PUT /api/v1/projects/{project_id}
   */
  async updateProject(
    projectId: number,
    data: ProjectUpdate
  ): Promise<Project> {
    return apiClient
      .put<Project>(`${this.baseUrl}/${projectId}`, data)
      .then((res) => res.data);
  }

  /**
   * Удалить проект
   * DELETE /api/v1/projects/{project_id}
   */
  async deleteProject(
    projectId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient
      .delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/${projectId}`)
      .then((res) => res.data);
  }

  /**
   * Получить требования проекта
   * GET /api/v1/projects/{project_id}/requirements
   */
  async getProjectRequirements(
    projectId: number,
    filters?: {
      status?: string[];
      type?: string[];
      priority?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    items: Requirement[];
    total: number;
    page: number;
    per_page: number;
  }> {
    return apiClient
      .get<{
        items: Requirement[];
        total: number;
        page: number;
        per_page: number;
      }>(`${this.baseUrl}/${projectId}/requirements`, {
        params: filters,
      })
      .then((res) => res.data);
  }

  /**
   * Синхронизировать требования проекта с релизом
   * POST /api/v1/projects/{project_id}/sync-to-release
   */
  async syncProjectToRelease(
    projectId: number,
    data: {
      release_id: number;
      requirement_ids?: number[];
      sync_all?: boolean;
    }
  ): Promise<ApiResponse<{ synced_requirements: number; message: string }>> {
    return apiClient
      .post<ApiResponse<{ synced_requirements: number; message: string }>>(
        `${this.baseUrl}/${projectId}/sync-to-release`,
        data
      )
      .then((res) => res.data);
  }

  /**
   * Получить релизы проекта
   * GET /api/v1/projects/{project_id}/releases
   */
  async getProjectReleases(
    projectId: number,
    filters?: {
      status?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    items: Release[];
    total: number;
    page: number;
    per_page: number;
  }> {
    return apiClient
      .get<{
        items: Release[];
        total: number;
        page: number;
        per_page: number;
      }>(`${this.baseUrl}/${projectId}/releases`, {
        params: filters,
      })
      .then((res) => res.data);
  }

  /**
   * Получить статистику проекта
   * GET /api/v1/projects/{project_id}/stats
   */
  async getProjectStats(projectId: number): Promise<ProjectStats> {
    return apiClient
      .get<ProjectStats>(`${this.baseUrl}/${projectId}/stats`)
      .then((res) => res.data);
  }

  /**
   * Получить участников проекта
   */
  async getProjectMembers(projectId: number): Promise<UserProfile[]> {
    return apiClient
      .get<UserProfile[]>(`${this.baseUrl}/${projectId}/members`)
      .then((res) => res.data);
  }

  /**
   * Добавить участника в проект
   */
  async addProjectMember(
    projectId: number,
    data: {
      user_id: number;
      role?: string;
    }
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient
      .post<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${projectId}/members`,
        data
      )
      .then((res) => res.data);
  }

  /**
   * Удалить участника из проекта
   */
  async removeProjectMember(
    projectId: number,
    userId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient
      .delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${projectId}/members/${userId}`
      )
      .then((res) => res.data);
  }

  /**
   * Архивировать проект
   */
  async archiveProject(
    projectId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient
      .post<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${projectId}/archive`
      )
      .then((res) => res.data);
  }

  /**
   * Восстановить проект из архива
   */
  async unarchiveProject(
    projectId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient
      .post<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${projectId}/unarchive`
      )
      .then((res) => res.data);
  }

  /**
   * Экспорт проекта
   */
  async exportProject(
    projectId: number,
    format: "json" | "csv" | "excel" = "json"
  ): Promise<Blob> {
    return apiClient
      .get<Blob>(`${this.baseUrl}/${projectId}/export`, {
        params: { format },
        responseType: "blob",
      })
      .then((res) => res.data);
  }
}

// Экспорт singleton экземпляра
export const projectApi = new ProjectApi();
