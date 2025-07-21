import { client } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type { Project, ProjectFilters, CreateProjectData, UpdateProjectData } from "../model/types";

export const projectApi = {
  /**
   * Получить список проектов
   */
  getProjects: async (filters: ProjectFilters = {}): Promise<Project[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const response = await client.get(
      `${API_ENDPOINTS.PROJECTS.LIST}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Получить проект по ID
   */
  getProject: async (id: string): Promise<Project> => {
    const response = await client.get(API_ENDPOINTS.PROJECTS.GET(id));
    return response.data;
  },

  /**
   * Создать новый проект
   */
  createProject: async (data: CreateProjectData): Promise<Project> => {
    const response = await client.post(API_ENDPOINTS.PROJECTS.CREATE, data);
    return response.data;
  },

  /**
   * Обновить проект
   */
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await client.put(API_ENDPOINTS.PROJECTS.UPDATE(id), data);
    return response.data;
  },

  /**
   * Удалить проект
   */
  deleteProject: async (projectId: string): Promise<void> => {
    await client.delete(API_ENDPOINTS.PROJECTS.DELETE(projectId));
  },

  /**
   * Получить статистику проекта
   */
  getProjectStats: async (projectId: string) => {
    const response = await client.get(API_ENDPOINTS.PROJECTS.STATS(projectId));
    return response.data;
  },

  /**
   * Поиск проектов
   */
  searchProjects: async (query: string, filters: ProjectFilters = {}) => {
    const params = new URLSearchParams();
    params.append("search", query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const url = `${API_ENDPOINTS.PROJECTS.LIST}?${params.toString()}`;
    const response = await client.get(url);
    return response.data;
  },

  /**
   * Получить требования проекта
   */
  getProjectRequirements: async (projectId: string) => {
    const response = await client.get(API_ENDPOINTS.PROJECTS.REQUIREMENTS(projectId));
    return response.data;
  },

  /**
   * Получить релизы проекта
   */
  getProjectReleases: async (projectId: string) => {
    const response = await client.get(API_ENDPOINTS.PROJECTS.RELEASES(projectId));
    return response.data;
  },

  /**
   * Синхронизировать требования с релизом
   */
  syncProjectToRelease: async (
    projectId: string,
    releaseData: { releaseId: string; requirementIds: string[] }
  ) => {
    const response = await client.post(
      API_ENDPOINTS.PROJECTS.SYNC_TO_RELEASE(projectId),
      releaseData
    );
    return response.data;
  },
};
