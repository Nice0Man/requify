/**
 * Requirement React Query Hooks
 * Хуки для работы с требованиями через React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementDAO } from './requirementDAO';
import type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementQueryParams,
  RequirementListResponse,
} from '../model/types';

// Query Keys
export const requirementKeys = {
  all: ['requirements'] as const,
  lists: () => [...requirementKeys.all, 'list'] as const,
  list: (params?: RequirementQueryParams) => [...requirementKeys.lists(), params] as const,
  details: () => [...requirementKeys.all, 'detail'] as const,
  detail: (id: number) => [...requirementKeys.details(), id] as const,
  search: (query: string, filters?: RequirementQueryParams) => 
    [...requirementKeys.all, 'search', query, filters] as const,
  project: (projectId: number) => 
    [...requirementKeys.all, 'project', projectId] as const,
  projectList: (projectId: number, params?: RequirementQueryParams) => 
    [...requirementKeys.project(projectId), 'list', params] as const,
  comments: (id: number) => [...requirementKeys.detail(id), 'comments'] as const,
  relations: (id: number) => [...requirementKeys.detail(id), 'relations'] as const,
  stats: (projectId?: number) => 
    [...requirementKeys.all, 'stats', projectId] as const,
  dashboard: (projectId?: number) => 
    [...requirementKeys.all, 'dashboard', projectId] as const,
};

/**
 * Хук для получения списка требований
 */
export const useRequirements = (params?: RequirementQueryParams) => {
  return useQuery({
    queryKey: requirementKeys.list(params),
    queryFn: () => requirementDAO.getRequirements(params),
    staleTime: 3 * 60 * 1000, // 3 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

/**
 * Хук для получения требований проекта
 */
export const useProjectRequirements = (
  projectId: number, 
  params?: RequirementQueryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: requirementKeys.projectList(projectId, params),
    queryFn: () => requirementDAO.getProjectRequirements(projectId, params),
    enabled: enabled && !!projectId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Хук для получения требования по ID
 */
export const useRequirement = (id: number, enabled = true) => {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: () => requirementDAO.getRequirementById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Хук для получения требования с детальной информацией
 */
export const useRequirementWithDetails = (id: number, enabled = true) => {
  return useQuery({
    queryKey: [...requirementKeys.detail(id), 'details'],
    queryFn: () => requirementDAO.getRequirementWithDetails(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Хук для поиска требований
 */
export const useSearchRequirements = (
  query: string, 
  filters?: RequirementQueryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: requirementKeys.search(query, filters),
    queryFn: () => requirementDAO.searchRequirements(query, filters),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Хук для получения комментариев к требованию
 */
export const useRequirementComments = (id: number, enabled = true) => {
  return useQuery({
    queryKey: requirementKeys.comments(id),
    queryFn: () => requirementDAO.getRequirementComments(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 минута для комментариев
  });
};

/**
 * Хук для получения связей требования
 */
export const useRequirementRelations = (id: number, enabled = true) => {
  return useQuery({
    queryKey: requirementKeys.relations(id),
    queryFn: () => requirementDAO.getRequirementRelations(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Хук для получения статистики требований
 */
export const useRequirementStats = (projectId?: number, enabled = true) => {
  return useQuery({
    queryKey: requirementKeys.stats(projectId),
    queryFn: () => projectId 
      ? requirementDAO.getRequirementStatistics(projectId)
      : requirementDAO.getRequirementDashboard(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Хук для получения дашборда требований
 */
export const useRequirementDashboard = (projectId?: number) => {
  return useQuery({
    queryKey: requirementKeys.dashboard(projectId),
    queryFn: () => requirementDAO.getRequirementDashboard(projectId),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Хук для создания требования
 */
export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequirementCreate) => requirementDAO.createRequirement(data),
    onSuccess: (newRequirement) => {
      // Инвалидируем списки требований
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      
      // Инвалидируем требования проекта
      if (newRequirement.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: requirementKeys.project(newRequirement.project_id) 
        });
      }
      
      // Добавляем новое требование в кеш
      queryClient.setQueryData(
        requirementKeys.detail(newRequirement.id),
        newRequirement
      );
    },
  });
};

/**
 * Хук для обновления требования
 */
export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RequirementUpdate }) =>
      requirementDAO.updateRequirement(id, data),
    onSuccess: (updatedRequirement, { id }) => {
      // Обновляем кеш требования
      queryClient.setQueryData(
        requirementKeys.detail(id),
        updatedRequirement
      );
      
      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      
      // Инвалидируем требования проекта
      if (updatedRequirement.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: requirementKeys.project(updatedRequirement.project_id) 
        });
      }
    },
  });
};

/**
 * Хук для удаления требования
 */
export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => requirementDAO.deleteRequirement(id),
    onSuccess: (_, id) => {
      // Удаляем из кеша
      queryClient.removeQueries({ queryKey: requirementKeys.detail(id) });
      
      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
};

/**
 * Хук для создания комментария
 */
export const useAddRequirementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requirementDAO.addComment,
    onSuccess: (_, variables) => {
      // Инвалидируем комментарии к требованию
      queryClient.invalidateQueries({ 
        queryKey: requirementKeys.comments(variables.requirement_id) 
      });
    },
  });
};

/**
 * Хук для создания связи между требованиями
 */
export const useCreateRequirementRelation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requirementDAO.createRelation,
    onSuccess: (_, variables) => {
      // Инвалидируем связи для обоих требований
      queryClient.invalidateQueries({ 
        queryKey: requirementKeys.relations(variables.source_requirement_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: requirementKeys.relations(variables.target_requirement_id) 
      });
    },
  });
};

/**
 * Хук для архивирования требования
 */
export const useArchiveRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => requirementDAO.archiveRequirement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
};

/**
 * Хук для клонирования требования
 */
export const useCloneRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetProjectId }: { id: number; targetProjectId?: number }) =>
      requirementDAO.cloneRequirement(id, targetProjectId),
    onSuccess: (clonedRequirement) => {
      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      
      // Инвалидируем требования проекта
      if (clonedRequirement.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: requirementKeys.project(clonedRequirement.project_id) 
        });
      }
      
      // Добавляем клонированное требование в кеш
      queryClient.setQueryData(
        requirementKeys.detail(clonedRequirement.id),
        clonedRequirement
      );
    },
  });
}; 