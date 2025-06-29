import { apiClient, ApiClient, ApiResponse } from '@/shared/api/client';
import {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementListParams,
  RequirementListResponse,
  RequirementGroup,
  RequirementGroupCreate,
  RequirementGroupUpdate,
  RequirementRelationship,
  RequirementComment,
  RequirementHistory,
  RequirementStats,
  RequirementSearchParams,
  RequirementStatusChange,
  RequirementRelationshipCreate
} from '../types/requirement.types';



export class RequirementsApi {
  constructor(private client = apiClient) {}

  // 1. Search Requirements
  async searchRequirements(params: RequirementSearchParams): Promise<ApiResponse<RequirementListResponse>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(`${key}[]`, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.client.get<RequirementListResponse>(`/requirements/search?${queryParams.toString()}`);
  }

  // 2. Get Requirements
  async getRequirements(params?: RequirementListParams): Promise<ApiResponse<RequirementListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.status_id) queryParams.append('status_id', params.status_id.toString());
    if (params?.type_id) queryParams.append('type_id', params.type_id.toString());
    if (params?.priority_id) queryParams.append('priority_id', params.priority_id.toString());
    if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/requirements/?${queryString}` : '/requirements/';
    
    return this.client.get<RequirementListResponse>(url);
  }

  // 3. Create Requirement
  async createRequirement(requirementData: RequirementCreate): Promise<ApiResponse<Requirement>> {
    return this.client.post<Requirement>('/requirements/', requirementData);
  }

  // 4. Get Requirement
  async getRequirement(requirementId: number): Promise<ApiResponse<Requirement>> {
    return this.client.get<Requirement>(`/requirements/${requirementId}`);
  }

  // 5. Update Requirement
  async updateRequirement(requirementId: number, requirementData: RequirementUpdate): Promise<ApiResponse<Requirement>> {
    return this.client.put<Requirement>(`/requirements/${requirementId}`, requirementData);
  }

  // 6. Delete Requirement
  async deleteRequirement(requirementId: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/requirements/${requirementId}`);
  }

  // 7. Change Requirement Status
  async changeRequirementStatus(requirementId: number, statusChange: RequirementStatusChange): Promise<ApiResponse<Requirement>> {
    return this.client.post<Requirement>(`/requirements/${requirementId}/change-status`, statusChange);
  }

  // 8. Get Requirement Tests
  async getRequirementTests(requirementId: number, params?: { skip?: number; limit?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/requirements/${requirementId}/tests?${queryString}` : `/requirements/${requirementId}/tests`;
    
    return this.client.get<any>(url);
  }

  // 9. Get Requirement Relationships
  async getRequirementRelationships(requirementId: number, params?: { skip?: number; limit?: number }): Promise<ApiResponse<{ items: RequirementRelationship[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/requirements/${requirementId}/relationships?${queryString}` : `/requirements/${requirementId}/relationships`;
    
    return this.client.get<{ items: RequirementRelationship[]; total: number }>(url);
  }

  // 10. Create Requirement Relationship
  async createRequirementRelationship(requirementId: number, relationshipData: RequirementRelationshipCreate): Promise<ApiResponse<RequirementRelationship>> {
    return this.client.post<RequirementRelationship>(`/requirements/${requirementId}/relationships`, relationshipData);
  }

  // Status operations
  async bulkChangeStatus(ids: number[], status: string): Promise<ApiResponse<{ updated_count: number }>> {
    return this.client.patch<{ updated_count: number }>('/requirements/bulk/status', {
      requirement_ids: ids,
      status
    });
  }

  // Assignment operations
  async assignRequirement(id: number, assignedTo: number): Promise<ApiResponse<Requirement>> {
    return this.client.patch<Requirement>(`/requirements/${id}/assign`, { assigned_to: assignedTo });
  }

  async bulkAssign(ids: number[], assignedTo: number): Promise<ApiResponse<{ updated_count: number }>> {
    return this.client.patch<{ updated_count: number }>('/requirements/bulk/assign', {
      requirement_ids: ids,
      assigned_to: assignedTo
    });
  }

  // Tags operations
  async updateRequirementTags(id: number, tags: string[]): Promise<ApiResponse<Requirement>> {
    return this.client.patch<Requirement>(`/requirements/${id}/tags`, { tags });
  }

  // History and comments
  async getRequirementHistory(id: number): Promise<ApiResponse<RequirementHistory[]>> {
    return this.client.get<RequirementHistory[]>(`/requirements/${id}/history`);
  }

  async getRequirementComments(id: number): Promise<ApiResponse<RequirementComment[]>> {
    return this.client.get<RequirementComment[]>(`/requirements/${id}/comments`);
  }

  async addRequirementComment(id: number, content: string): Promise<ApiResponse<RequirementComment>> {
    return this.client.post<RequirementComment>(`/requirements/${id}/comments`, { content });
  }

  async updateRequirementComment(requirementId: number, commentId: number, content: string): Promise<ApiResponse<RequirementComment>> {
    return this.client.put<RequirementComment>(`/requirements/${requirementId}/comments/${commentId}`, { content });
  }

  async deleteRequirementComment(requirementId: number, commentId: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/requirements/${requirementId}/comments/${commentId}`);
  }

  // Relationships
  async deleteRelationship(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/relationships/${id}`);
  }

  // Groups management
  async getRequirementGroups(projectId: number): Promise<ApiResponse<RequirementGroup[]>> {
    return this.client.get<RequirementGroup[]>(`/requirements/groups?project_id=${projectId}`);
  }

  async createRequirementGroup(data: RequirementGroupCreate): Promise<ApiResponse<RequirementGroup>> {
    return this.client.post<RequirementGroup>('/requirements/groups', data);
  }

  async updateRequirementGroup(id: number, data: RequirementGroupUpdate): Promise<ApiResponse<RequirementGroup>> {
    return this.client.put<RequirementGroup>(`/requirements/groups/${id}`, data);
  }

  async deleteRequirementGroup(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/requirements/groups/${id}`);
  }

  async reorderGroups(projectId: number, groupOrders: Array<{ id: number; order_index: number }>): Promise<ApiResponse<{ message: string }>> {
    return this.client.patch<{ message: string }>('/requirements/groups/reorder', {
      project_id: projectId,
      group_orders: groupOrders
    });
  }

  // Statistics and analytics
  async getRequirementStats(projectId: number): Promise<ApiResponse<RequirementStats>> {
    return this.client.get<RequirementStats>(`/requirements/stats?project_id=${projectId}`);
  }

  // Import/Export
  async exportRequirements(projectId: number, format: 'csv' | 'excel' | 'pdf' = 'excel'): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(`/requirements/export?project_id=${projectId}&format=${format}`, {
      responseType: 'blob'
    });
  }

  async importRequirements(projectId: number, file: File, mappings?: Record<string, string>): Promise<ApiResponse<{ imported_count: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId.toString());
    if (mappings) {
      formData.append('mappings', JSON.stringify(mappings));
    }

    return this.client.post<{ imported_count: number; errors: string[] }>('/requirements/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getRequirementsByProject(projectId: number): Promise<ApiResponse<Requirement[]>> {
    return this.client.get<Requirement[]>(`/requirements?project_id=${projectId}`);
  }
}

// Export singleton instance
export const requirementsApi = new RequirementsApi(); 