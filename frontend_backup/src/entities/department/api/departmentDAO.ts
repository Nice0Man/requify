/**
 * Department Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/department.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentListResponse,
  DepartmentDetailResponse,
  DepartmentQueryParams,
  DepartmentBulkOperation,
  DepartmentValidationResult,
  DepartmentStatsResponse,
  DepartmentHierarchy,
} from "../model/types";

/**
 * DepartmentDAO - класс для работы с API департаментов
 */
export class DepartmentDAO {
  private static instance: DepartmentDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): DepartmentDAO {
    if (!DepartmentDAO.instance) {
      DepartmentDAO.instance = new DepartmentDAO();
    }
    return DepartmentDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список департаментов
   */
  async getDepartments(params?: DepartmentQueryParams): Promise<DepartmentListResponse> {
    try {
      const response = await client.get<DepartmentListResponse>(
        API_ENDPOINTS.DEPARTMENTS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get departments:", error);
      throw error;
    }
  }

  /**
   * Получить департамент по ID
   */
  async getDepartmentById(id: string): Promise<DepartmentDetailResponse> {
    try {
      const response = await client.get<DepartmentDetailResponse>(
        API_ENDPOINTS.DEPARTMENTS.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить департаменты по компании
   */
  async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
    try {
      const response = await client.get<Department[]>(
        API_ENDPOINTS.DEPARTMENTS.BY_COMPANY(companyId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get departments for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый департамент
   */
  async createDepartment(data: DepartmentCreate): Promise<Department> {
    try {
      const response = await client.post<Department>(
        API_ENDPOINTS.DEPARTMENTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create department:", error);
      throw error;
    }
  }

  /**
   * Обновить департамент
   */
  async updateDepartment(id: string, data: DepartmentUpdate): Promise<Department> {
    try {
      const response = await client.put<Department>(
        API_ENDPOINTS.DEPARTMENTS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить департамент
   */
  async deleteDepartment(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Активировать департамент
   */
  async activateDepartment(id: string): Promise<Department> {
    try {
      const response = await client.post<Department>(
        API_ENDPOINTS.DEPARTMENTS.ACTIVATE(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to activate department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Деактивировать департамент
   */
  async deactivateDepartment(id: string): Promise<Department> {
    try {
      const response = await client.post<Department>(
        API_ENDPOINTS.DEPARTMENTS.DEACTIVATE(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to deactivate department ${id}:`, error);
      throw error;
    }
  }

  // === Операции с участниками ===

  /**
   * Получить участников департамента
   */
  async getDepartmentMembers(id: string): Promise<any[]> {
    try {
      const response = await client.get<any[]>(
        API_ENDPOINTS.DEPARTMENTS.MEMBERS(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get department members ${id}:`, error);
      throw error;
    }
  }

  // === Статистика ===

  /**
   * Получить статистику департамента
   */
  async getDepartmentStats(id: string): Promise<DepartmentStatsResponse> {
    try {
      const response = await client.get<DepartmentStatsResponse>(
        API_ENDPOINTS.DEPARTMENTS.STATS(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get department stats ${id}:`, error);
      throw error;
    }
  }

  // === Иерархия департаментов ===

  /**
   * Получить иерархию департаментов компании
   */
  async getDepartmentHierarchy(companyId: string): Promise<DepartmentHierarchy[]> {
    try {
      const response = await client.get<DepartmentHierarchy[]>(
        `/companies/${companyId}/departments/hierarchy`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get department hierarchy for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Переместить департамент в иерархии
   */
  async moveDepartment(
    id: string,
    newParentId?: string,
    position?: number
  ): Promise<Department> {
    try {
      const response = await client.post<Department>(
        `/departments/${id}/move`,
        {
          new_parent_id: newParentId ? parseInt(newParentId) : null,
          position,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to move department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Объединить департаменты
   */
  async mergeDepartments(
    sourceIds: string[],
    targetId: string,
    options: {
      keepTeams: boolean;
      keepEmployees: boolean;
    }
  ): Promise<Department> {
    try {
      const response = await client.post<Department>(
        `/departments/merge`,
        {
          source_ids: sourceIds.map(id => parseInt(id)),
          target_id: parseInt(targetId),
          keep_teams: options.keepTeams,
          keep_employees: options.keepEmployees,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to merge departments:", error);
      throw error;
    }
  }

  // === Bulk операции ===

  /**
   * Выполнить массовую операцию над департаментами
   */
  async bulkOperation(operation: DepartmentBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/departments/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk operation:", error);
      throw error;
    }
  }

  // === Validation операции ===

  /**
   * Валидировать данные департамента
   */
  async validateDepartment(data: DepartmentCreate | DepartmentUpdate): Promise<DepartmentValidationResult> {
    try {
      const response = await client.post<DepartmentValidationResult>(
        "/departments/validate",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to validate department:", error);
      throw error;
    }
  }

  /**
   * Проверить возможность перемещения департамента
   */
  async validateMove(
    sourceId: string,
    targetParentId?: string
  ): Promise<{ can_move: boolean; reason?: string }> {
    try {
      const response = await client.post<{ can_move: boolean; reason?: string }>(
        `/departments/${sourceId}/validate-move`,
        {
          target_parent_id: targetParentId ? parseInt(targetParentId) : null,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to validate department move ${sourceId}:`, error);
      throw error;
    }
  }

  // === Поиск и фильтрация ===

  /**
   * Поиск департаментов
   */
  async searchDepartments(
    query: string,
    filters?: {
      company_id?: number;
      type?: string;
      is_active?: boolean;
    }
  ): Promise<Department[]> {
    try {
      const response = await client.get<Department[]>(
        "/departments/search",
        {
          params: {
            q: query,
            ...filters,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to search departments:", error);
      throw error;
    }
  }

  // === Экспорт/импорт ===

  /**
   * Экспорт данных департаментов
   */
  async exportDepartments(
    companyId: string,
    format: 'csv' | 'xlsx' | 'json' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await client.get(
        `/companies/${companyId}/departments/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to export departments for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Импорт данных департаментов
   */
  async importDepartments(
    companyId: string,
    file: File
  ): Promise<{ imported_count: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await client.post<{ imported_count: number; errors: string[] }>(
        `/companies/${companyId}/departments/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to import departments for company ${companyId}:`, error);
      throw error;
    }
  }
}

// Экспорт singleton instance
export const departmentDAO = DepartmentDAO.getInstance();