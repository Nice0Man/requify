import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectManagementApi } from '../api/project-management.api';
import type { ProjectFormData } from './project-management.types';

export const useProjectManagement = (projectId?: number) => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectManagementApi.getProjects(),
  });

  const currentProjectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectManagementApi.getProject(projectId!),
    enabled: !!projectId,
  });

  const membersQuery = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectManagementApi.getProjectMembers(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectManagementApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectFormData }) => 
      projectManagementApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    currentProject: currentProjectQuery.data,
    members: membersQuery.data || [],
    isLoading: projectsQuery.isLoading || currentProjectQuery.isLoading || membersQuery.isLoading,
    error: projectsQuery.error || currentProjectQuery.error || membersQuery.error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

export const useProjectForm = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectManagementApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject: createMutation.mutateAsync,
    isLoading: createMutation.isPending,
    error: createMutation.error,
  };
}; 