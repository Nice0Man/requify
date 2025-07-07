/**
 * Project Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/project.py
 */

import { client } from '@/shared/api/client';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectQueryParams,
  ProjectBulkOperation,
  ProjectImportData,
  ProjectExportOptions,
  ProjectValidationResult,
  ProjectTeamMember,
  ProjectTeamRequest,
  ProjectTeamResponse,
  ProjectStatistics,
  ProjectActivityResponse,
  ProjectSettings,
  ProjectTemplate,
  ProjectTemplateCreate,
  ProjectFromTemplate,
  ProjectDashboard,
} from '@/shared/types/project';

/**
 * ProjectDAO - класс для работы с API проектов
 */
export class ProjectDAO {
  private static instance: ProjectDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): ProjectDAO {
    if (!ProjectDAO.instance) {
      ProjectDAO.instance = new ProjectDAO();
    }
    return ProjectDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список проектов
   */
  async getProjects(params?: ProjectQueryParams): Promise<ProjectListResponse> {
    try {
      const response = await client.get<ProjectListResponse>('/projects', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  /**
   * Получить проект по ID
   */
  async getProjectById(id: number): Promise<ProjectDetailResponse> {
    try {
      const response = await client.get<ProjectDetailResponse>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить проект по коду
   */
  async getProjectByCode(code: string): Promise<ProjectDetailResponse> {
    try {
      const response = await client.get<ProjectDetailResponse>(`/projects/code/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project by code ${code}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый проект
   */
  async createProject(projectData: ProjectCreate): Promise<Project> {
    try {
      const response = await client.post<Project>('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Обновить проект
   */
  async updateProject(id: number, projectData: ProjectUpdate): Promise<Project> {
    try {
      const response = await client.put<Project>(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Частично обновить проект
   */
  async patchProject(id: number, projectData: Partial<ProjectUpdate>): Promise<Project> {
    try {
      const response = await client.patch<Project>(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Failed to patch project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить проект
   */
  async deleteProject(id: number): Promise<void> {
    try {
      await client.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw error;
    }
  }

  // === Проекты со статистикой ===

  /**
   * Получить проект со статистикой
   */
  async getProjectWithStats(id: number): Promise<ProjectWithStats> {
    try {
      const response = await client.get<ProjectWithStats>(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project stats for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить список проектов со статистикой
   */
  async getProjectsWithStats(params?: ProjectQueryParams): Promise<{ projects: ProjectWithStats[]; total: number }> {
    try {
      const response = await client.get<{ projects: ProjectWithStats[]; total: number }>('/projects/with-stats', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get projects with stats:', error);
      throw error;
    }
  }

  // === Управление командой ===

  /**
   * Получить команду проекта
   */
  async getProjectTeam(id: number): Promise<ProjectTeamResponse> {
    try {
      const response = await client.get<ProjectTeamResponse>(`/projects/${id}/team`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project team for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Добавить участника в команду проекта
   */
  async addTeamMember(id: number, memberData: ProjectTeamRequest): Promise<ProjectTeamMember> {
    try {
      const response = await client.post<ProjectTeamMember>(`/projects/${id}/team`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Failed to add team member to project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Обновить роль участника команды
   */
  async updateTeamMember(id: number, userId: number, memberData: Partial<ProjectTeamRequest>): Promise<ProjectTeamMember> {
    try {
      const response = await client.put<ProjectTeamMember>(`/projects/${id}/team/${userId}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update team member ${userId} in project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить участника из команды проекта
   */
  async removeTeamMember(id: number, userId: number): Promise<void> {
    try {
      await client.delete(`/projects/${id}/team/${userId}`);
    } catch (error) {
      console.error(`Failed to remove team member ${userId} from project ${id}:`, error);
      throw error;
    }
  }

  // === Статистика и активность ===

  /**
   * Получить подробную статистику проекта
   */
  async getProjectStatistics(id: number): Promise<ProjectStatistics> {
    try {
      const response = await client.get<ProjectStatistics>(`/projects/${id}/statistics`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project statistics for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить активность проекта
   */
  async getProjectActivity(id: number, page = 1, perPage = 20): Promise<ProjectActivityResponse> {
    try {
      const response = await client.get<ProjectActivityResponse>(`/projects/${id}/activity`, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get project activity for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить дашборд проекта
   */
  async getProjectDashboard(id: number): Promise<ProjectDashboard> {
    try {
      const response = await client.get<ProjectDashboard>(`/projects/${id}/dashboard`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project dashboard for ${id}:`, error);
      throw error;
    }
  }

  // === Настройки проекта ===

  /**
   * Получить настройки проекта
   */
  async getProjectSettings(id: number): Promise<ProjectSettings> {
    try {
      const response = await client.get<ProjectSettings>(`/projects/${id}/settings`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get project settings for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Обновить настройки проекта
   */
  async updateProjectSettings(id: number, settings: Partial<ProjectSettings>): Promise<ProjectSettings> {
    try {
      const response = await client.put<ProjectSettings>(`/projects/${id}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error(`Failed to update project settings for ${id}:`, error);
      throw error;
    }
  }

  // === Массовые операции ===

  /**
   * Выполнить массовую операцию над проектами
   */
  async bulkOperation(operation: ProjectBulkOperation): Promise<void> {
    try {
      await client.post('/projects/bulk', operation);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      throw error;
    }
  }

  /**
   * Импорт проектов
   */
  async importProjects(data: ProjectImportData): Promise<void> {
    try {
      await client.post('/projects/import', data);
    } catch (error) {
      console.error('Failed to import projects:', error);
      throw error;
    }
  }

  /**
   * Экспорт проектов
   */
  async exportProjects(options: ProjectExportOptions): Promise<Blob> {
    try {
      const response = await client.post('/projects/export', options, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export projects:', error);
      throw error;
    }
  }

  // === Валидация ===

  /**
   * Валидация данных проекта
   */
  async validateProject(projectData: ProjectCreate | ProjectUpdate): Promise<ProjectValidationResult> {
    try {
      const response = await client.post<ProjectValidationResult>('/projects/validate', projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to validate project data:', error);
      throw error;
    }
  }

  /**
   * Проверка доступности кода проекта
   */
  async checkCodeAvailability(code: string): Promise<boolean> {
    try {
      const response = await client.get<{ available: boolean }>(`/projects/check-code/${code}`);
      return response.data.available;
    } catch (error) {
      console.error('Failed to check code availability:', error);
      throw error;
    }
  }

  /**
   * Проверка доступности названия проекта
   */
  async checkNameAvailability(name: string): Promise<boolean> {
    try {
      const response = await client.get<{ available: boolean }>(`/projects/check-name/${encodeURIComponent(name)}`);
      return response.data.available;
    } catch (error) {
      console.error('Failed to check name availability:', error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск проектов
   */
  async searchProjects(query: string, filters?: ProjectQueryParams): Promise<ProjectListResponse> {
    try {
      const response = await client.get<ProjectListResponse>('/projects/search', {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search projects:', error);
      throw error;
    }
  }

  // === Архивирование ===

  /**
   * Архивировать проект
   */
  async archiveProject(id: number): Promise<void> {
    try {
      await client.post(`/projects/${id}/archive`);
    } catch (error) {
      console.error(`Failed to archive project ${id}:`, error);
      throw error;
    }
  }

  /**
   * Восстановить проект из архива
   */
  async unarchiveProject(id: number): Promise<void> {
    try {
      await client.post(`/projects/${id}/unarchive`);
    } catch (error) {
      console.error(`Failed to unarchive project ${id}:`, error);
      throw error;
    }
  }

  // === Клонирование ===

  /**
   * Клонировать проект
   */
  async cloneProject(id: number, newProjectData: { code: string; name: string; description?: string }): Promise<Project> {
    try {
      const response = await client.post<Project>(`/projects/${id}/clone`, newProjectData);
      return response.data;
    } catch (error) {
      console.error(`Failed to clone project ${id}:`, error);
      throw error;
    }
  }

  // === Шаблоны проектов ===

  /**
   * Получить список шаблонов проектов
   */
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    try {
      const response = await client.get<ProjectTemplate[]>('/projects/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to get project templates:', error);
      throw error;
    }
  }

  /**
   * Создать шаблон проекта
   */
  async createProjectTemplate(templateData: ProjectTemplateCreate): Promise<ProjectTemplate> {
    try {
      const response = await client.post<ProjectTemplate>('/projects/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Failed to create project template:', error);
      throw error;
    }
  }

  /**
   * Создать проект из шаблона
   */
  async createProjectFromTemplate(data: ProjectFromTemplate): Promise<Project> {
    try {
      const response = await client.post<Project>('/projects/from-template', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create project from template:', error);
      throw error;
    }
  }

  // === Мои проекты ===

  /**
   * Получить проекты текущего пользователя
   */
  async getMyProjects(params?: ProjectQueryParams): Promise<ProjectListResponse> {
    try {
      const response = await client.get<ProjectListResponse>('/projects/my', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get my projects:', error);
      throw error;
    }
  }

  /**
   * Получить проекты где пользователь участник команды
   */
  async getMyTeamProjects(params?: ProjectQueryParams): Promise<ProjectListResponse> {
    try {
      const response = await client.get<ProjectListResponse>('/projects/my-team', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get my team projects:', error);
      throw error;
    }
  }

  // === Избранные проекты ===

  /**
   * Добавить проект в избранное
   */
  async addToFavorites(id: number): Promise<void> {
    try {
      await client.post(`/projects/${id}/favorite`);
    } catch (error) {
      console.error(`Failed to add project ${id} to favorites:`, error);
      throw error;
    }
  }

  /**
   * Удалить проект из избранного
   */
  async removeFromFavorites(id: number): Promise<void> {
    try {
      await client.delete(`/projects/${id}/favorite`);
    } catch (error) {
      console.error(`Failed to remove project ${id} from favorites:`, error);
      throw error;
    }
  }

  /**
   * Получить избранные проекты
   */
  async getFavoriteProjects(params?: ProjectQueryParams): Promise<ProjectListResponse> {
    try {
      const response = await client.get<ProjectListResponse>('/projects/favorites', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get favorite projects:', error);
      throw error;
    }
  }
}

// Экспортируем singleton instance
export const projectDAO = ProjectDAO.getInstance(); 