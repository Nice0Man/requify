import { apiClient } from '@/shared/api/client';
import type {
  Comment,
  CommentCreate,
  CommentUpdate,
} from '../model/types';
import type { PaginatedResponse, ApiResponse } from '@/shared/types/api';

/**
 * Comments API - layer for backend interaction for comments
 * According to FSD principles, contains only API functions without business logic
 */
export class CommentsApi {
  private readonly baseUrl = '/api/v1/comments';

  /**
   * Get comments list
   */
  async getComments(params?: {
    skip?: number;
    limit?: number;
    entity_type?: string;
    entity_id?: number;
    user_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Comment>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams}`
      : this.baseUrl;

    return apiClient.get<PaginatedResponse<Comment>>(url).then(res => res.data);
  }

  /**
   * Get comment by ID
   */
  async getComment(id: number): Promise<Comment> {
    return apiClient.get<Comment>(`${this.baseUrl}/${id}`).then(res => res.data);
  }

  /**
   * Create new comment
   */
  async createComment(data: CommentCreate): Promise<Comment> {
    return apiClient.post<Comment>(this.baseUrl, data).then(res => res.data);
  }

  /**
   * Update comment
   */
  async updateComment(id: number, data: CommentUpdate): Promise<Comment> {
    return apiClient.put<Comment>(`${this.baseUrl}/${id}`, data).then(res => res.data);
  }

  /**
   * Delete comment
   */
  async deleteComment(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`).then(res => res.data);
  }

  /**
   * Get comments for requirement
   */
  async getRequirementComments(requirementId: number, params?: {
    skip?: number;
    limit?: number;
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Comment>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/requirements/${requirementId}/comments?${searchParams}`
      : `${this.baseUrl}/requirements/${requirementId}/comments`;

    return apiClient.get<PaginatedResponse<Comment>>(url).then(res => res.data);
  }

  /**
   * Create comment for requirement
   */
  async createRequirementComment(
    requirementId: number, 
    data: CommentCreate
  ): Promise<Comment> {
    return apiClient.post<Comment>(`${this.baseUrl}/requirements/${requirementId}/comments`, data).then(res => res.data);
  }

  /**
   * Get recent comments
   */
  async getRecentComments(params?: {
    skip?: number;
    limit?: number;
    entity_types?: string[];
    user_id?: number;
    hours?: number;
  }): Promise<PaginatedResponse<Comment>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/recent?${searchParams}`
      : `${this.baseUrl}/recent`;

    return apiClient.get<PaginatedResponse<Comment>>(url).then(res => res.data);
  }

  /**
   * Get comments statistics
   */
  async getCommentsStatistics(params?: {
    entity_type?: string;
    entity_id?: number;
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month' | 'user';
  }): Promise<{
    total_comments: number;
    comments_by_entity_type: Record<string, number>;
    comments_by_user: Array<{
      user_id: number;
      user_name: string;
      comment_count: number;
    }>;
    recent_activity: Array<{
      date: string;
      count: number;
    }>;
    most_commented_entities: Array<{
      entity_type: string;
      entity_id: number;
      entity_title?: string;
      comment_count: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.baseUrl}/statistics?${searchParams}`
      : `${this.baseUrl}/statistics`;

    return apiClient.get<{
      total_comments: number;
      comments_by_entity_type: Record<string, number>;
      comments_by_user: Array<{
        user_id: number;
        user_name: string;
        comment_count: number;
      }>;
      recent_activity: Array<{
        date: string;
        count: number;
      }>;
      most_commented_entities: Array<{
        entity_type: string;
        entity_id: number;
        entity_title?: string;
        comment_count: number;
      }>;
    }>(url).then(res => res.data);
  }

  /**
   * Search comments
   */
  async searchComments(query: string, filters?: {
    entity_type?: string;
    entity_id?: number;
    user_id?: number;
    created_from?: string;
    created_to?: string;
    is_internal?: boolean;
  }): Promise<Comment[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('search', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get<Comment[]>(`${this.baseUrl}/search?${searchParams}`).then(res => res.data);
  }

  /**
   * Bulk delete comments
   */
  async bulkDeleteComments(commentIds: number[]): Promise<ApiResponse<{
    deleted: number;
    failed: number;
    errors: Array<{
      comment_id: number;
      error: string;
    }>;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/bulk-delete`, {
      comment_ids: commentIds
    }).then(res => res.data);
  }

  /**
   * Mark comment as read/unread
   */
  async markCommentAsRead(id: number, isRead: boolean = true): Promise<ApiResponse<Comment>> {
    return apiClient.post<ApiResponse<Comment>>(`${this.baseUrl}/${id}/mark-read`, {
      is_read: isRead
    }).then(res => res.data);
  }

  /**
   * Pin/unpin comment
   */
  async pinComment(id: number, isPinned: boolean = true): Promise<ApiResponse<Comment>> {
    return apiClient.post<ApiResponse<Comment>>(`${this.baseUrl}/${id}/pin`, {
      is_pinned: isPinned
    }).then(res => res.data);
  }

  /**
   * Report comment
   */
  async reportComment(id: number, data: {
    reason: string;
    description?: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${id}/report`, data).then(res => res.data);
  }

  /**
   * Get comment history/versions
   */
  async getCommentHistory(id: number): Promise<Array<{
    id: number;
    content: string;
    edited_at: string;
    edited_by: number;
    edited_by_name?: string;
  }>> {
    return apiClient.get<any[]>(`${this.baseUrl}/${id}/history`).then(res => res.data);
  }
}

// Export API instance for use in application
export const commentsApi = new CommentsApi(); 