/**
 * Role Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/enhanced_role.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Role,
  RoleCreate,
  RoleUpdate,
  Permission,
  PermissionCreate,
  PermissionUpdate,
  UserRoleAssignment,
  UserRoleAssignmentCreate,
  UserRoleAssignmentUpdate,
  RoleListResponse,
  RoleDetailResponse,
  PermissionListResponse,
  UserRoleAssignmentListResponse,
  RoleQueryParams,
  PermissionQueryParams,
  UserRoleQueryParams,
  RoleBulkOperation,
  UserRoleBulkOperation,
  RoleValidationResult,
  RoleStatsResponse,
} from "../model/types";

/**
 * RoleDAO - класс для работы с API ролей
 */
export class RoleDAO {
  private static instance: RoleDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): RoleDAO {
    if (!RoleDAO.instance) {
      RoleDAO.instance = new RoleDAO();
    }
    return RoleDAO.instance;
  }

  // === CRUD операции с ролями ===

  /**
   * Получить список ролей
   */
  async getRoles(params?: RoleQueryParams): Promise<RoleListResponse> {
    try {
      const response = await client.get<RoleListResponse>(
        API_ENDPOINTS.ROLES.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get roles:", error);
      throw error;
    }
  }

  /**
   * Получить роль по ID
   */
  async getRoleById(id: string): Promise<RoleDetailResponse> {
    try {
      const response = await client.get<RoleDetailResponse>(
        API_ENDPOINTS.ROLES.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get role ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать новую роль
   */
  async createRole(data: RoleCreate): Promise<Role> {
    try {
      const response = await client.post<Role>(
        API_ENDPOINTS.ROLES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create role:", error);
      throw error;
    }
  }

  /**
   * Обновить роль
   */
  async updateRole(id: string, data: RoleUpdate): Promise<Role> {
    try {
      const response = await client.put<Role>(
        API_ENDPOINTS.ROLES.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update role ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить роль
   */
  async deleteRole(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.ROLES.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete role ${id}:`, error);
      throw error;
    }
  }

  // === Операции с разрешениями ролей ===

  /**
   * Получить разрешения роли
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const response = await client.get<Permission[]>(
        API_ENDPOINTS.ROLES.PERMISSIONS(roleId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get role permissions ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить разрешения роли
   */
  async updateRolePermissions(
    roleId: string,
    permissionIds: number[]
  ): Promise<Permission[]> {
    try {
      const response = await client.put<Permission[]>(
        API_ENDPOINTS.ROLES.UPDATE_PERMISSIONS(roleId),
        { permission_ids: permissionIds }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update role permissions ${roleId}:`, error);
      throw error;
    }
  }

  // === Операции с назначением ролей пользователям ===

  /**
   * Назначить роль пользователю
   */
  async assignRoleToUser(
    roleId: string,
    userId: string,
    data?: Partial<UserRoleAssignmentCreate>
  ): Promise<UserRoleAssignment> {
    try {
      const response = await client.post<UserRoleAssignment>(
        API_ENDPOINTS.ROLES.ASSIGN_USER(roleId, userId),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to assign role ${roleId} to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Отозвать роль у пользователя
   */
  async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.ROLES.REMOVE_USER(roleId, userId));
    } catch (error) {
      console.error(`Failed to remove role ${roleId} from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Получить пользователей роли
   */
  async getRoleUsers(roleId: string): Promise<any[]> {
    try {
      const response = await client.get<any[]>(
        API_ENDPOINTS.ROLES.USERS(roleId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get role users ${roleId}:`, error);
      throw error;
    }
  }

  // === Операции с разрешениями (общие) ===

  /**
   * Получить список всех разрешений
   */
  async getPermissions(params?: PermissionQueryParams): Promise<PermissionListResponse> {
    try {
      const response = await client.get<PermissionListResponse>(
        "/permissions",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get permissions:", error);
      throw error;
    }
  }

  // === Bulk операции ===

  /**
   * Выполнить массовую операцию над ролями
   */
  async bulkRoleOperation(operation: RoleBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/roles/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk role operation:", error);
      throw error;
    }
  }

  // === Validation операции ===

  /**
   * Валидировать данные роли
   */
  async validateRole(data: RoleCreate | RoleUpdate): Promise<RoleValidationResult> {
    try {
      const response = await client.post<RoleValidationResult>(
        "/roles/validate",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to validate role:", error);
      throw error;
    }
  }

  // === Статистика ===

  /**
   * Получить статистику ролей
   */
  async getRoleStats(): Promise<RoleStatsResponse> {
    try {
      const response = await client.get<RoleStatsResponse>("/roles/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to get role stats:", error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск ролей
   */
  async searchRoles(query: string, filters?: Partial<RoleQueryParams>): Promise<Role[]> {
    try {
      const response = await client.get<Role[]>("/roles/search", {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search roles:", error);
      throw error;
    }
  }
}

// Экспорт singleton instance
export const roleDAO = RoleDAO.getInstance();