/**
 * Team Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/team.py
 */

import { client } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';
import type {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMember,
  TeamMemberCreate,
  TeamMemberUpdate,
  TeamStats,
  TeamListResponse,
  TeamDetailResponse,
  TeamMemberListResponse,
  TeamStatsResponse,
  TeamStatsOverviewResponse,
  TeamQueryParams,
  BulkCreateTeamsRequest,
  BulkAddMembersRequest,
  PermissionCheckRequest,
  PermissionCheckResponse,
  TeamValidationResult,
  TeamExportOptions,
  TeamImportData,
} from './types';

/**
 * TeamDAO - класс для работы с API команд
 */
export class TeamDAO {
  private static instance: TeamDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): TeamDAO {
    if (!TeamDAO.instance) {
      TeamDAO.instance = new TeamDAO();
    }
    return TeamDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список команд
   */
  async getTeams(params?: TeamQueryParams): Promise<TeamListResponse> {
    try {
      const response = await client.get<TeamListResponse>(
        API_ENDPOINTS.TEAMS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get teams:', error);
      throw error;
    }
  }

  /**
   * Получить команду по ID
   */
  async getTeamById(id: number): Promise<TeamDetailResponse> {
    try {
      const response = await client.get<TeamDetailResponse>(
        API_ENDPOINTS.TEAMS.GET(id.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get team ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать новую команду
   */
  async createTeam(teamData: TeamCreate): Promise<Team> {
    try {
      const response = await client.post<Team>(
        API_ENDPOINTS.TEAMS.CREATE,
        teamData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  /**
   * Обновить команду
   */
  async updateTeam(id: number, teamData: TeamUpdate): Promise<Team> {
    try {
      const response = await client.put<Team>(
        API_ENDPOINTS.TEAMS.UPDATE(id.toString()),
        teamData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update team ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить команду
   */
  async deleteTeam(id: number): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.TEAMS.DELETE(id.toString()));
    } catch (error) {
      console.error(`Failed to delete team ${id}:`, error);
      throw error;
    }
  }

  // === Архивирование ===

  /**
   * Архивировать команду
   */
  async archiveTeam(id: number): Promise<Team> {
    try {
      const response = await client.post<Team>(
        API_ENDPOINTS.TEAMS.ARCHIVE(id.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to archive team ${id}:`, error);
      throw error;
    }
  }

  /**
   * Восстановить команду из архива
   */
  async restoreTeam(id: number): Promise<Team> {
    try {
      const response = await client.post<Team>(
        API_ENDPOINTS.TEAMS.RESTORE(id.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to restore team ${id}:`, error);
      throw error;
    }
  }

  // === Управление участниками ===

  /**
   * Получить список участников команды
   */
  async getTeamMembers(teamId: number): Promise<TeamMemberListResponse> {
    try {
      const response = await client.get<TeamMemberListResponse>(
        API_ENDPOINTS.TEAMS.MEMBERS(teamId.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get team ${teamId} members:`, error);
      throw error;
    }
  }

  /**
   * Добавить участника в команду
   */
  async addTeamMember(teamId: number, memberData: TeamMemberCreate): Promise<TeamMember> {
    try {
      const response = await client.post<TeamMember>(
        API_ENDPOINTS.TEAMS.ADD_MEMBER(teamId.toString()),
        memberData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add member to team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить участника команды
   */
  async updateTeamMember(
    teamId: number,
    userId: number,
    memberData: TeamMemberUpdate
  ): Promise<TeamMember> {
    try {
      const response = await client.put<TeamMember>(
        API_ENDPOINTS.TEAMS.UPDATE_MEMBER(teamId.toString(), userId.toString()),
        memberData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update member ${userId} in team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить участника из команды
   */
  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    try {
      await client.delete(
        API_ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId.toString(), userId.toString())
      );
    } catch (error) {
      console.error(`Failed to remove member ${userId} from team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Изменить роль участника команды
   */
  async changeTeamMemberRole(
    teamId: number,
    userId: number,
    roleData: TeamMemberUpdate
  ): Promise<TeamMember> {
    try {
      const response = await client.post<TeamMember>(
        API_ENDPOINTS.TEAMS.CHANGE_MEMBER_ROLE(teamId.toString(), userId.toString()),
        roleData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to change role for member ${userId} in team ${teamId}:`, error);
      throw error;
    }
  }

  // === Массовые операции ===

  /**
   * Массовое создание команд
   */
  async bulkCreateTeams(data: BulkCreateTeamsRequest): Promise<Team[]> {
    try {
      const response = await client.post<Team[]>(
        API_ENDPOINTS.TEAMS.BULK_CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk create teams:', error);
      throw error;
    }
  }

  /**
   * Массовое добавление участников
   */
  async bulkAddMembers(teamId: number, data: BulkAddMembersRequest): Promise<TeamMember[]> {
    try {
      const response = await client.post<TeamMember[]>(
        API_ENDPOINTS.TEAMS.BULK_ADD_MEMBERS(teamId.toString()),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to bulk add members to team ${teamId}:`, error);
      throw error;
    }
  }

  // === Статистика ===

  /**
   * Получить статистику команды
   */
  async getTeamStats(teamId: number): Promise<TeamStatsResponse> {
    try {
      const response = await client.get<TeamStatsResponse>(
        API_ENDPOINTS.TEAMS.TEAM_STATS(teamId.toString())
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get stats for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Получить общую статистику команд
   */
  async getTeamStatsOverview(): Promise<TeamStatsOverviewResponse> {
    try {
      const response = await client.get<TeamStatsOverviewResponse>(
        API_ENDPOINTS.TEAMS.STATS_OVERVIEW
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get team stats overview:', error);
      throw error;
    }
  }

  // === Права доступа ===

  /**
   * Проверить права доступа
   */
  async checkPermissions(data: PermissionCheckRequest): Promise<PermissionCheckResponse> {
    try {
      const response = await client.post<PermissionCheckResponse>(
        API_ENDPOINTS.TEAMS.CHECK_PERMISSIONS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check team permissions:', error);
      throw error;
    }
  }

  // === Валидация ===

  /**
   * Валидация данных команды
   */
  async validateTeam(teamData: TeamCreate): Promise<TeamValidationResult> {
    try {
      const response = await client.post<TeamValidationResult>(
        `${API_ENDPOINTS.TEAMS.LIST}/validate`,
        teamData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to validate team:', error);
      throw error;
    }
  }

  // === Экспорт/Импорт ===

  /**
   * Экспорт команд
   */
  async exportTeams(options: TeamExportOptions): Promise<Blob> {
    try {
      const response = await client.post(
        `${API_ENDPOINTS.TEAMS.LIST}/export`,
        options,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export teams:', error);
      throw error;
    }
  }

  /**
   * Импорт команд
   */
  async importTeams(data: TeamImportData): Promise<TeamValidationResult> {
    try {
      const response = await client.post<TeamValidationResult>(
        `${API_ENDPOINTS.TEAMS.LIST}/import`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Failed to import teams:', error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск команд
   */
  async searchTeams(query: string, params?: TeamQueryParams): Promise<TeamListResponse> {
    try {
      const searchParams = { ...params, search: query };
      return await this.getTeams(searchParams);
    } catch (error) {
      console.error('Failed to search teams:', error);
      throw error;
    }
  }
} 