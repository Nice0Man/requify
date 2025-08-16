/**
 * Project React Query Hooks
 * Хуки для работы с проектами через React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectDAO } from './projectDAO';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectQueryParams,
  ProjectListResponse,
  ProjectWithStats,
} from '../model/types';

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ProjectQueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
  dashboard: () => [...projectKeys.all, 'dashboard'] as const,
};

/**
 * Хук для получения списка проектов
 */
export const useProjects = (params?: ProjectQueryParams) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectDAO.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

/**
 * Хук для получения проекта по ID
 */
export const useProject = (id: number, enabled = true) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectDAO.getProjectById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Хук для создания проекта
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) => projectDAO.createProject(data),
    onSuccess: () => {
      // Инвалидируем кеш списка проектов
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * Хук для обновления проекта
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) =>
      projectDAO.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Обновляем кеш конкретного проекта
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject
      );
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * Хук для удаления проекта
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectDAO.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Удаляем из кеша
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * Хук для получения статистики проектов
 */
export const useProjectsStats = () => {
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: () => projectDAO.getProjectsStats(),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 15 * 60 * 1000, // 15 минут
  });
};

/**
 * Хук для получения данных дашборда проектов
 */
export const useProjectsDashboard = () => {
  return useQuery({
    queryKey: projectKeys.dashboard(),
    queryFn: () => projectDAO.getProjectsDashboard(),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}; 