/**
 * Requirement Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/requirement.py
 */

import { client } from '@/shared/api/client';
import type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementListResponse,
  RequirementDetailResponse,
  RequirementQueryParams,
  RequirementBulkOperation,
  RequirementImportData,
  RequirementExportOptions,
  RequirementValidationResult,
  RequirementComment,
  RequirementCommentCreate,
  RequirementCommentUpdate,
  RequirementAttachment,
  RequirementAttachmentUpload,
  RequirementRelation,
  RequirementRelationCreate,
  RequirementStatistics,
  RequirementDashboard,
  RequirementTemplate,
  RequirementTemplateCreate,
  RequirementFromTemplate,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementSpec,
  RequirementApproval,
  RequirementApprovalRequest,
  RequirementNotification,
  RequirementChangeHistory,
} from '@/shared/types/requirement';

/**
 * RequirementDAO - класс для работы с API требований
 */
export class RequirementDAO {
  private static instance: RequirementDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): RequirementDAO {
    if (!RequirementDAO.instance) {
      RequirementDAO.instance = new RequirementDAO();
    }
    return RequirementDAO.instance;
  }

  // === CRUD операции ===

  /**
   * Получить список требований
   */
  async getRequirements(params?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>('/requirements', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get requirements:', error);
      throw error;
    }
  }

  /**
   * Получить требование по ID
   */
  async getRequirementById(id: number): Promise<RequirementDetailResponse> {
    try {
      const response = await client.get<RequirementDetailResponse>(`/requirements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать новое требование
   */
  async createRequirement(requirementData: RequirementCreate): Promise<Requirement> {
    try {
      const response = await client.post<Requirement>('/requirements', requirementData);
      return response.data;
    } catch (error) {
      console.error('Failed to create requirement:', error);
      throw error;
    }
  }

  /**
   * Обновить требование
   */
  async updateRequirement(id: number, requirementData: RequirementUpdate): Promise<Requirement> {
    try {
      const response = await client.put<Requirement>(`/requirements/${id}`, requirementData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Частично обновить требование
   */
  async patchRequirement(id: number, requirementData: Partial<RequirementUpdate>): Promise<Requirement> {
    try {
      const response = await client.patch<Requirement>(`/requirements/${id}`, requirementData);
      return response.data;
    } catch (error) {
      console.error(`Failed to patch requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить требование
   */
  async deleteRequirement(id: number): Promise<void> {
    try {
      await client.delete(`/requirements/${id}`);
    } catch (error) {
      console.error(`Failed to delete requirement ${id}:`, error);
      throw error;
    }
  }

  // === Требования с детализацией ===

  /**
   * Получить требование с подробной информацией
   */
  async getRequirementWithDetails(id: number): Promise<RequirementWithDetails> {
    try {
      const response = await client.get<RequirementWithDetails>(`/requirements/${id}/details`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirement details for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить требование с результатами тестирования
   */
  async getRequirementWithTestResults(id: number): Promise<RequirementWithTestResults> {
    try {
      const response = await client.get<RequirementWithTestResults>(`/requirements/${id}/test-results`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirement test results for ${id}:`, error);
      throw error;
    }
  }

  // === Комментарии ===

  /**
   * Получить комментарии к требованию
   */
  async getRequirementComments(id: number): Promise<RequirementComment[]> {
    try {
      const response = await client.get<RequirementComment[]>(`/requirements/${id}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get comments for requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Добавить комментарий к требованию
   */
  async addComment(commentData: RequirementCommentCreate): Promise<RequirementComment> {
    try {
      const response = await client.post<RequirementComment>('/requirements/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * Обновить комментарий
   */
  async updateComment(commentId: number, commentData: RequirementCommentUpdate): Promise<RequirementComment> {
    try {
      const response = await client.put<RequirementComment>(`/requirements/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить комментарий
   */
  async deleteComment(commentId: number): Promise<void> {
    try {
      await client.delete(`/requirements/comments/${commentId}`);
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  }

  // === Вложения ===

  /**
   * Получить вложения требования
   */
  async getRequirementAttachments(id: number): Promise<RequirementAttachment[]> {
    try {
      const response = await client.get<RequirementAttachment[]>(`/requirements/${id}/attachments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get attachments for requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Загрузить вложение к требованию
   */
  async uploadAttachment(attachmentData: RequirementAttachmentUpload): Promise<RequirementAttachment> {
    try {
      const formData = new FormData();
      formData.append('file', attachmentData.file);
      formData.append('requirement_id', attachmentData.requirement_id.toString());
      if (attachmentData.description) {
        formData.append('description', attachmentData.description);
      }

      const response = await client.post<RequirementAttachment>('/requirements/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw error;
    }
  }

  /**
   * Скачать вложение
   */
  async downloadAttachment(attachmentId: number): Promise<Blob> {
    try {
      const response = await client.get(`/requirements/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить вложение
   */
  async deleteAttachment(attachmentId: number): Promise<void> {
    try {
      await client.delete(`/requirements/attachments/${attachmentId}`);
    } catch (error) {
      console.error(`Failed to delete attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  // === Связи между требованиями ===

  /**
   * Получить связи требования
   */
  async getRequirementRelations(id: number): Promise<RequirementRelation[]> {
    try {
      const response = await client.get<RequirementRelation[]>(`/requirements/${id}/relations`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get relations for requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Создать связь между требованиями
   */
  async createRelation(relationData: RequirementRelationCreate): Promise<RequirementRelation> {
    try {
      const response = await client.post<RequirementRelation>('/requirements/relations', relationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create requirement relation:', error);
      throw error;
    }
  }

  /**
   * Удалить связь между требованиями
   */
  async deleteRelation(relationId: number): Promise<void> {
    try {
      await client.delete(`/requirements/relations/${relationId}`);
    } catch (error) {
      console.error(`Failed to delete relation ${relationId}:`, error);
      throw error;
    }
  }

  // === Массовые операции ===

  /**
   * Выполнить массовую операцию над требованиями
   */
  async bulkOperation(operation: RequirementBulkOperation): Promise<void> {
    try {
      await client.post('/requirements/bulk', operation);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      throw error;
    }
  }

  /**
   * Импорт требований
   */
  async importRequirements(data: RequirementImportData): Promise<void> {
    try {
      await client.post('/requirements/import', data);
    } catch (error) {
      console.error('Failed to import requirements:', error);
      throw error;
    }
  }

  /**
   * Экспорт требований
   */
  async exportRequirements(options: RequirementExportOptions): Promise<Blob> {
    try {
      const response = await client.post('/requirements/export', options, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export requirements:', error);
      throw error;
    }
  }

  // === Валидация ===

  /**
   * Валидация данных требования
   */
  async validateRequirement(requirementData: RequirementCreate | RequirementUpdate): Promise<RequirementValidationResult> {
    try {
      const response = await client.post<RequirementValidationResult>('/requirements/validate', requirementData);
      return response.data;
    } catch (error) {
      console.error('Failed to validate requirement data:', error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск требований
   */
  async searchRequirements(query: string, filters?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>('/requirements/search', {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search requirements:', error);
      throw error;
    }
  }

  // === Статистика ===

  /**
   * Получить статистику по требованиям проекта
   */
  async getRequirementStatistics(projectId: number): Promise<RequirementStatistics> {
    try {
      const response = await client.get<RequirementStatistics>(`/requirements/statistics/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirement statistics for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить дашборд требований
   */
  async getRequirementDashboard(projectId?: number): Promise<RequirementDashboard> {
    try {
      const url = projectId ? `/requirements/dashboard/${projectId}` : '/requirements/dashboard';
      const response = await client.get<RequirementDashboard>(url);
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement dashboard:', error);
      throw error;
    }
  }

  // === Шаблоны требований ===

  /**
   * Получить список шаблонов требований
   */
  async getRequirementTemplates(projectId?: number): Promise<RequirementTemplate[]> {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const response = await client.get<RequirementTemplate[]>('/requirements/templates', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement templates:', error);
      throw error;
    }
  }

  /**
   * Создать шаблон требования
   */
  async createRequirementTemplate(templateData: RequirementTemplateCreate): Promise<RequirementTemplate> {
    try {
      const response = await client.post<RequirementTemplate>('/requirements/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Failed to create requirement template:', error);
      throw error;
    }
  }

  /**
   * Создать требование из шаблона
   */
  async createRequirementFromTemplate(data: RequirementFromTemplate): Promise<Requirement> {
    try {
      const response = await client.post<Requirement>('/requirements/from-template', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create requirement from template:', error);
      throw error;
    }
  }

  // === Метаданные ===

  /**
   * Получить типы требований
   */
  async getRequirementTypes(projectId?: number): Promise<RequirementType[]> {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const response = await client.get<RequirementType[]>('/requirements/types', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement types:', error);
      throw error;
    }
  }

  /**
   * Получить приоритеты требований
   */
  async getRequirementPriorities(): Promise<RequirementPriority[]> {
    try {
      const response = await client.get<RequirementPriority[]>('/requirements/priorities');
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement priorities:', error);
      throw error;
    }
  }

  /**
   * Получить статусы требований
   */
  async getRequirementStatuses(projectId?: number): Promise<RequirementStatus[]> {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const response = await client.get<RequirementStatus[]>('/requirements/statuses', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement statuses:', error);
      throw error;
    }
  }

  /**
   * Получить спецификации
   */
  async getRequirementSpecs(projectId: number): Promise<RequirementSpec[]> {
    try {
      const response = await client.get<RequirementSpec[]>(`/requirements/specs`, {
        params: { project_id: projectId },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirement specs for project ${projectId}:`, error);
      throw error;
    }
  }

  // === Требования по проекту ===

  /**
   * Получить требования проекта
   */
  async getProjectRequirements(projectId: number, params?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>(`/projects/${projectId}/requirements`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to get requirements for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Получить мои требования
   */
  async getMyRequirements(params?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>('/requirements/my', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get my requirements:', error);
      throw error;
    }
  }

  /**
   * Получить просроченные требования
   */
  async getOverdueRequirements(params?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>('/requirements/overdue', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get overdue requirements:', error);
      throw error;
    }
  }

  /**
   * Получить требования с приближающимся дедлайном
   */
  async getUpcomingDeadlines(days = 7, params?: RequirementQueryParams): Promise<RequirementListResponse> {
    try {
      const response = await client.get<RequirementListResponse>('/requirements/upcoming-deadlines', {
        params: { days, ...params },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get requirements with upcoming deadlines:', error);
      throw error;
    }
  }

  // === История изменений ===

  /**
   * Получить историю изменений требования
   */
  async getRequirementChangeHistory(id: number): Promise<RequirementChangeHistory[]> {
    try {
      const response = await client.get<RequirementChangeHistory[]>(`/requirements/${id}/history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get change history for requirement ${id}:`, error);
      throw error;
    }
  }

  // === Согласования ===

  /**
   * Получить согласования требования
   */
  async getRequirementApprovals(id: number): Promise<RequirementApproval[]> {
    try {
      const response = await client.get<RequirementApproval[]>(`/requirements/${id}/approvals`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get approvals for requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Запросить согласование требования
   */
  async requestApproval(approvalData: RequirementApprovalRequest): Promise<void> {
    try {
      await client.post('/requirements/approvals/request', approvalData);
    } catch (error) {
      console.error('Failed to request approval:', error);
      throw error;
    }
  }

  /**
   * Согласовать требование
   */
  async approveRequirement(approvalId: number, comment?: string): Promise<void> {
    try {
      await client.post(`/requirements/approvals/${approvalId}/approve`, { comment });
    } catch (error) {
      console.error(`Failed to approve requirement ${approvalId}:`, error);
      throw error;
    }
  }

  /**
   * Отклонить требование
   */
  async rejectRequirement(approvalId: number, comment?: string): Promise<void> {
    try {
      await client.post(`/requirements/approvals/${approvalId}/reject`, { comment });
    } catch (error) {
      console.error(`Failed to reject requirement ${approvalId}:`, error);
      throw error;
    }
  }

  // === Уведомления ===

  /**
   * Получить уведомления по требованиям
   */
  async getRequirementNotifications(): Promise<RequirementNotification[]> {
    try {
      const response = await client.get<RequirementNotification[]>('/requirements/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to get requirement notifications:', error);
      throw error;
    }
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await client.post(`/requirements/notifications/${notificationId}/read`);
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  // === Архивирование ===

  /**
   * Архивировать требование
   */
  async archiveRequirement(id: number): Promise<void> {
    try {
      await client.post(`/requirements/${id}/archive`);
    } catch (error) {
      console.error(`Failed to archive requirement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Восстановить требование из архива
   */
  async unarchiveRequirement(id: number): Promise<void> {
    try {
      await client.post(`/requirements/${id}/unarchive`);
    } catch (error) {
      console.error(`Failed to unarchive requirement ${id}:`, error);
      throw error;
    }
  }

  // === Клонирование ===

  /**
   * Клонировать требование
   */
  async cloneRequirement(id: number, targetProjectId?: number): Promise<Requirement> {
    try {
      const data = targetProjectId ? { project_id: targetProjectId } : {};
      const response = await client.post<Requirement>(`/requirements/${id}/clone`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to clone requirement ${id}:`, error);
      throw error;
    }
  }
}

// Экспортируем singleton instance
export const requirementDAO = RequirementDAO.getInstance(); 