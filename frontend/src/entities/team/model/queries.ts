import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamDAO } from '../api/teamDAO';
import type {
  Team,
  TeamMember,
  TeamStats,
  TeamCreate,
  TeamUpdate,
  TeamMemberCreate,
  TeamMemberUpdate,
  TeamListResponse,
  TeamStatsOverviewResponse,
  BulkCreateTeamsRequest,
  BulkAddMembersRequest,
  PermissionCheckRequest,
  TeamQueryParams
} from '../api/types';

// Query keys factory for teams
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters?: TeamFilters) => [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
  members: (id: string) => [...teamKeys.detail(id), 'members'] as const,
  stats: (id: string) => [...teamKeys.detail(id), 'stats'] as const,
  statsOverview: () => [...teamKeys.all, 'stats-overview'] as const,
  permissions: (teamId: string, userId: string) => 
    [...teamKeys.detail(teamId), 'permissions', userId] as const,
};

/**
 * Hook для получения списка команд
 */
export const useTeams = (params?: TeamQueryParams) => {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => TeamDAO.getInstance().getTeams(params),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

/**
 * Hook для получения команды по ID
 */
export const useTeam = (teamId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: teamKeys.detail(teamId.toString()),
    queryFn: () => TeamDAO.getInstance().getTeamById(teamId),
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook для получения участников команды
 */
export const useTeamMembers = (teamId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: teamKeys.members(teamId.toString()),
    queryFn: () => TeamDAO.getInstance().getTeamMembers(teamId),
    enabled: enabled && !!teamId,
    staleTime: 2 * 60 * 1000, // 2 минуты для участников
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook для получения статистики команды
 */
export const useTeamStats = (teamId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: teamKeys.stats(teamId.toString()),
    queryFn: () => TeamDAO.getInstance().getTeamStats(teamId),
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook для получения общей статистики команд
 */
export const useTeamStatsOverview = () => {
  return useQuery({
    queryKey: teamKeys.statsOverview(),
    queryFn: () => TeamDAO.getInstance().getTeamStatsOverview(),
    staleTime: 10 * 60 * 1000, // 10 минут для общей статистики
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Hook для создания команды
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamCreate) => TeamDAO.getInstance().createTeam(data),
    onSuccess: (newTeam) => {
      // Обновляем список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Обновляем общую статистику
      queryClient.invalidateQueries({ queryKey: teamKeys.statsOverview() });
      // Добавляем новую команду в кеш
      queryClient.setQueryData(teamKeys.detail(newTeam.id.toString()), newTeam);
    },
  });
};

/**
 * Hook для обновления команды
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: TeamUpdate }) =>
      TeamDAO.getInstance().updateTeam(teamId, data),
    onSuccess: (updatedTeam, { teamId }) => {
      // Обновляем конкретную команду
      queryClient.setQueryData(teamKeys.detail(teamId.toString()), updatedTeam);
      // Обновляем список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

/**
 * Hook для удаления команды
 */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => TeamDAO.getInstance().deleteTeam(teamId),
    onSuccess: (_, teamId) => {
      // Удаляем команду из кеша
      queryClient.removeQueries({ queryKey: teamKeys.detail(teamId.toString()) });
      // Обновляем список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Обновляем общую статистику
      queryClient.invalidateQueries({ queryKey: teamKeys.statsOverview() });
    },
  });
};

/**
 * Hook для архивирования команды
 */
export const useArchiveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => TeamDAO.getInstance().archiveTeam(teamId),
    onSuccess: (archivedTeam, teamId) => {
      // Обновляем команду в кеше
      queryClient.setQueryData(teamKeys.detail(teamId.toString()), archivedTeam);
      // Обновляем список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Обновляем статистику
      queryClient.invalidateQueries({ queryKey: teamKeys.statsOverview() });
    },
  });
};

/**
 * Hook для восстановления команды
 */
export const useRestoreTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => TeamDAO.getInstance().restoreTeam(teamId),
    onSuccess: (restoredTeam, teamId) => {
      // Обновляем команду в кеше
      queryClient.setQueryData(teamKeys.detail(teamId.toString()), restoredTeam);
      // Обновляем список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Обновляем статистику
      queryClient.invalidateQueries({ queryKey: teamKeys.statsOverview() });
    },
  });
};

/**
 * Hook для добавления участника в команду
 */
export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: TeamMemberCreate }) =>
      TeamDAO.getInstance().addTeamMember(teamId, data),
    onSuccess: (_, { teamId }) => {
      // Обновляем список участников
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId.toString()) });
      // Обновляем информацию о команде (счетчик участников)
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId.toString()) });
      // Обновляем статистику команды
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId.toString()) });
    },
  });
};

/**
 * Hook для обновления участника команды
 */
export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      teamId, 
      userId, 
      data 
    }: { 
      teamId: number; 
      userId: number; 
      data: TeamMemberUpdate 
    }) => TeamDAO.getInstance().updateTeamMember(teamId, userId, data),
    onSuccess: (_, { teamId }) => {
      // Обновляем список участников
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId.toString()) });
    },
  });
};

/**
 * Hook для удаления участника из команды
 */
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      TeamDAO.getInstance().removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      // Обновляем список участников
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId.toString()) });
      // Обновляем информацию о команде (счетчик участников)
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId.toString()) });
      // Обновляем статистику команды
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId.toString()) });
    },
  });
};

/**
 * Hook для изменения роли участника команды
 */
export const useChangeTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      teamId, 
      userId, 
      data 
    }: { 
      teamId: number; 
      userId: number; 
      data: TeamMemberUpdate 
    }) => TeamDAO.getInstance().changeTeamMemberRole(teamId, userId, data),
    onSuccess: (_, { teamId }) => {
      // Обновляем список участников
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId.toString()) });
    },
  });
};

/**
 * Hook для массового создания команд
 */
export const useBulkCreateTeams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateTeamsRequest) => TeamDAO.getInstance().bulkCreateTeams(data),
    onSuccess: () => {
      // Обновляем весь список команд
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // Обновляем общую статистику
      queryClient.invalidateQueries({ queryKey: teamKeys.statsOverview() });
    },
  });
};

/**
 * Hook для массового добавления участников
 */
export const useBulkAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: number; data: BulkAddMembersRequest }) =>
      TeamDAO.getInstance().bulkAddMembers(teamId, data),
    onSuccess: (_, { teamId }) => {
      // Обновляем список участников
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId.toString()) });
      // Обновляем информацию о команде
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId.toString()) });
      // Обновляем статистику команды
      queryClient.invalidateQueries({ queryKey: teamKeys.stats(teamId.toString()) });
    },
  });
};

/**
 * Hook для проверки прав доступа
 */
export const useCheckTeamPermissions = (
  data: PermissionCheckRequest,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: teamKeys.permissions(data.team_id.toString(), data.user_id.toString()),
    queryFn: () => TeamDAO.getInstance().checkPermissions(data),
    enabled: enabled && !!data.team_id && !!data.user_id,
    staleTime: 5 * 60 * 1000, // 5 минут для прав доступа
    gcTime: 10 * 60 * 1000,
  });
}; 