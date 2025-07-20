import type { Team, TeamMember, TeamStats } from './types';

/**
 * Мапперы для преобразования данных Teams API
 * Преобразуют данные с бэкенда в формат фронтенда
 */

/**
 * Преобразует команду с бэкенда в формат фронтенда
 */
export const mapTeamFromApi = (apiTeam: any): Team => ({
  id: Number(apiTeam.id || apiTeam.team_id),
  name: apiTeam.name || '',
  description: apiTeam.description || undefined,
  created_at: apiTeam.created_at || new Date().toISOString(),
  updated_at: apiTeam.updated_at || new Date().toISOString(),
  archived: Boolean(apiTeam.archived),
  archived_at: apiTeam.archived_at || undefined,
  creator_id: Number(apiTeam.creator_id || apiTeam.created_by),
  member_count: Number(apiTeam.member_count) || 0,
});

/**
 * Преобразует участника команды с бэкенда в формат фронтенда
 */
export const mapTeamMemberFromApi = (apiMember: any): TeamMember => ({
  user_id: Number(apiMember.user_id || apiMember.id),
  team_id: Number(apiMember.team_id),
  role: apiMember.role || 'member',
  joined_at: apiMember.joined_at || apiMember.created_at || new Date().toISOString(),
  updated_at: apiMember.updated_at || new Date().toISOString(),
  user: apiMember.user ? {
    id: Number(apiMember.user.id || apiMember.user.user_id),
    email: apiMember.user.email || '',
    username: apiMember.user.username || apiMember.user.login || '',
    first_name: apiMember.user.first_name || apiMember.user.firstname || undefined,
    last_name: apiMember.user.last_name || apiMember.user.lastname || undefined,
    avatar_url: apiMember.user.avatar_url || apiMember.user.avatar || undefined,
  } : undefined,
});

/**
 * Преобразует статистику команды с бэкенда в формат фронтенда
 */
export const mapTeamStatsFromApi = (apiStats: any): TeamStats => ({
  total_members: Number(apiStats.total_members) || 0,
  active_members: Number(apiStats.active_members) || 0,
  projects_count: Number(apiStats.projects_count) || Number(apiStats.total_projects) || 0,
  completed_projects: Number(apiStats.completed_projects) || 0,
  total_requirements: Number(apiStats.total_requirements) || 0,
  completed_requirements: Number(apiStats.completed_requirements) || 0,
});

/**
 * Преобразует данные для создания команды в формат API
 */
export const mapTeamToApi = (team: Partial<Team>) => ({
  name: team.name,
  description: team.description || null,
});

/**
 * Преобразует данные участника для API
 */
export const mapTeamMemberToApi = (member: Partial<TeamMember>) => ({
  user_id: Number(member.user_id),
  role: member.role || 'member',
});

/**
 * Массовое преобразование команд
 */
export const mapTeamsFromApi = (apiTeams: any[]): Team[] => {
  if (!Array.isArray(apiTeams)) return [];
  return apiTeams.map(mapTeamFromApi);
};

/**
 * Массовое преобразование участников команды
 */
export const mapTeamMembersFromApi = (apiMembers: any[]): TeamMember[] => {
  if (!Array.isArray(apiMembers)) return [];
  return apiMembers.map(mapTeamMemberFromApi);
}; 