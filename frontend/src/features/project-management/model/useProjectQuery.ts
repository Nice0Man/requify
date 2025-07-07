import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/projectApi';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/entities/project';

// Query Keys
export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...projectQueryKeys.lists(), filters] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectQueryKeys.details(), id] as const,
  stats: () => [...projectQueryKeys.all, 'stats'] as const,
};

// Queries
export const useProjects = (filters?: any) => {
  return useQuery({
    queryKey: projectQueryKeys.list(filters),
    queryFn: () => projectApi.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectQueryKeys.detail(id),
    queryFn: () => projectApi.getProject(id),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    enabled: !!id,
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: projectQueryKeys.stats(),
    queryFn: projectApi.getProjectStats,
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  });
};

// Mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      
      // Добавляем новый проект в кэш
      queryClient.setQueryData(projectQueryKeys.detail(newProject.id), newProject);
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Create project error:', error);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) => 
      projectApi.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Обновляем проект в кэше
      queryClient.setQueryData(projectQueryKeys.detail(updatedProject.id), updatedProject);
      
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Update project error:', error);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: (_, deletedId) => {
      // Удаляем проект из кэша
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(deletedId) });
      
      // Инвалидируем список проектов
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Delete project error:', error);
    },
  });
}; 
