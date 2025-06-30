import { apiClient, ApiResponse } from "@/shared/api/client";
import {
  RequirementWithDetails,
  RequirementListResponse,
  RequirementListParams,
  RequirementSearchParams,
  RequirementCreate,
  RequirementUpdate,
  Requirement,
  RequirementStatusChange,
  RequirementStats,
  RequirementGroup,
  RequirementGroupCreate,
  RequirementGroupUpdate,
} from "../types/requirements.types";

// Define correct types based on backend schema

export class RequirementsApi {
  constructor(private client = apiClient) {}

  // 1. Search Requirements
  async searchRequirements(
    params: RequirementSearchParams
  ): Promise<ApiResponse<RequirementListResponse>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    // Backend returns simple array, transform to expected format
    const response = await this.client.get<RequirementWithDetails[]>(
      `/requirements/search?${queryParams.toString()}`
    );
    const requirements = response.data || [];
    
    // Calculate pagination info (search typically doesn't paginate, but we maintain consistency)
    const total = requirements.length;
    const pages = 1; // Search results typically shown on single page
    
    return {
      data: {
        items: requirements,
        total: total,
        page: 0,
        size: total,
        pages: pages,
      },
      status: response.status,
      message: response.message,
    };
  }

  // 2. Get Requirements
  async getRequirements(
    params?: RequirementListParams
  ): Promise<ApiResponse<RequirementListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.project_id)
      queryParams.append("project_id", params.project_id.toString());
    if (params?.status_id)
      queryParams.append("status_id", params.status_id.toString());
    if (params?.type_id)
      queryParams.append("type_id", params.type_id.toString());
    if (params?.priority_id)
      queryParams.append("priority_id", params.priority_id.toString());
    if (params?.assigned_to)
      queryParams.append("assigned_to", params.assigned_to.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/requirements/?${queryString}`
      : "/requirements/";

    // Backend returns simple array, transform to expected format
    const response = await this.client.get<RequirementWithDetails[]>(url);
    const requirements = response.data || [];
    
    // Calculate pagination info
    const skip = params?.skip || 0;
    const limit = params?.limit || 100;
    const page = Math.floor(skip / limit);
    const total = requirements.length; // Note: This is not the real total from DB
    const pages = Math.ceil(total / limit);
    
    return {
      data: {
        items: requirements,
        total: total,
        page: page,
        size: limit,
        pages: pages,
      },
      status: response.status,
      message: response.message,
    };
  }

  // 3. Create Requirement
  async createRequirement(
    requirementData: RequirementCreate
  ): Promise<ApiResponse<Requirement>> {
    return this.client.post<Requirement>("/requirements/", requirementData);
  }

  // 4. Get Requirement
  async getRequirement(
    requirementId: number
  ): Promise<ApiResponse<RequirementWithDetails>> {
    return this.client.get<RequirementWithDetails>(
      `/requirements/${requirementId}`
    );
  }

  // 5. Update Requirement
  async updateRequirement(
    requirementId: number,
    requirementData: RequirementUpdate
  ): Promise<ApiResponse<Requirement>> {
    return this.client.put<Requirement>(
      `/requirements/${requirementId}`,
      requirementData
    );
  }

  // 6. Delete Requirement
  async deleteRequirement(
    requirementId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/requirements/${requirementId}`
    );
  }

  // 7. Change Requirement Status
  async changeRequirementStatus(
    requirementId: number,
    statusChange: RequirementStatusChange
  ): Promise<ApiResponse<Requirement>> {
    return this.client.post<Requirement>(
      `/requirements/${requirementId}/change-status`,
      statusChange
    );
  }

  // 8. Get Requirement Tests
  async getRequirementTests(
    requirementId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/requirements/${requirementId}/tests?${queryString}`
      : `/requirements/${requirementId}/tests`;

    return this.client.get<any>(url);
  }

  // 9. Get Requirement Relationships
  async getRequirementRelationships(
    requirementId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/requirements/${requirementId}/relationships?${queryString}`
      : `/requirements/${requirementId}/relationships`;

    return this.client.get<any>(url);
  }

  // 10. Create Requirement Relationship
  async createRequirementRelationship(
    requirementId: number,
    relationshipData: any
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(
      `/requirements/${requirementId}/relationships`,
      relationshipData
    );
  }

  // Status operations
  async bulkChangeStatus(
    ids: number[],
    status_id: number
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return this.client.patch<{ updated_count: number }>(
      "/requirements/bulk/status",
      {
        requirement_ids: ids,
        status_id,
      }
    );
  }

  // Assignment operations
  async assignRequirement(
    id: number,
    assignedTo: number
  ): Promise<ApiResponse<Requirement>> {
    return this.client.patch<Requirement>(`/requirements/${id}/assign`, {
      assigned_to: assignedTo,
    });
  }

  async bulkAssign(
    ids: number[],
    assignedTo: number
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return this.client.patch<{ updated_count: number }>(
      "/requirements/bulk/assign",
      {
        requirement_ids: ids,
        assigned_to: assignedTo,
      }
    );
  }

  // Tags operations
  async updateRequirementTags(
    id: number,
    tags: string[]
  ): Promise<ApiResponse<Requirement>> {
    return this.client.patch<Requirement>(`/requirements/${id}/tags`, { tags });
  }

  // History and comments
  async getRequirementHistory(id: number): Promise<ApiResponse<any[]>> {
    // Backend doesn't have history endpoint, use activity or comments
    try {
      const response = await this.client.get<any[]>(`/comments/requirements/${id}/comments`);
      return response;
    } catch (error) {
      return {
        data: [],
        status: 404,
        message: "History not available"
      };
    }
  }

  async getRequirementComments(id: number): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(`/requirements/${id}/comments`);
  }

  async addRequirementComment(
    id: number,
    content: string
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(`/requirements/${id}/comments`, { content });
  }

  async updateRequirementComment(
    requirementId: number,
    commentId: number,
    content: string
  ): Promise<ApiResponse<any>> {
    return this.client.put<any>(
      `/requirements/${requirementId}/comments/${commentId}`,
      { content }
    );
  }

  async deleteRequirementComment(
    requirementId: number,
    commentId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/requirements/${requirementId}/comments/${commentId}`
    );
  }

  // Relationships
  async deleteRelationship(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/relationships/${id}`);
  }

  // Groups management
  async getRequirementGroups(
    projectId: number
  ): Promise<ApiResponse<RequirementGroup[]>> {
    return this.client.get<RequirementGroup[]>(
      `/requirements/groups?project_id=${projectId}`
    );
  }

  async createRequirementGroup(
    data: RequirementGroupCreate
  ): Promise<ApiResponse<RequirementGroup>> {
    return this.client.post<RequirementGroup>("/requirements/groups", data);
  }

  async updateRequirementGroup(
    id: number,
    data: RequirementGroupUpdate
  ): Promise<ApiResponse<RequirementGroup>> {
    return this.client.put<RequirementGroup>(
      `/requirements/groups/${id}`,
      data
    );
  }

  async deleteRequirementGroup(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/requirements/groups/${id}`
    );
  }

  async reorderGroups(
    projectId: number,
    groupOrders: Array<{ id: number; order_index: number }>
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.patch<{ message: string }>(
      "/requirements/groups/reorder",
      {
        project_id: projectId,
        group_orders: groupOrders,
      }
    );
  }

  // Statistics and analytics
  async getRequirementStats(
    projectId: number
  ): Promise<ApiResponse<RequirementStats>> {
    return this.client.get<RequirementStats>(
      `/requirements/stats?project_id=${projectId}`
    );
  }

  // Import/Export
  async exportRequirements(params: {
    project_id?: number;
    status_ids?: number[];
    priority_ids?: number[];
    type_ids?: number[];
    include_relationships?: boolean;
    include_test_results?: boolean;
    include_comments?: boolean;
    format?: "csv" | "excel" | "pdf";
  }): Promise<ApiResponse<Blob>> {
    try {
      // Since backend doesn't have export endpoint, we'll get the data and export client-side
      const requirementParams: RequirementListParams = {
        project_id: params.project_id,
        status_id: params.status_ids?.[0], // Use first status if available
        priority_id: params.priority_ids?.[0], // Use first priority if available
        type_id: params.type_ids?.[0], // Use first type if available
        limit: 10000, // Get all requirements for export
      };

      const response = await this.getRequirements(requirementParams);
      const requirements = response.data.items || [];

      // Convert to CSV format as fallback
      const csvContent = this.convertToCSV(requirements);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      return {
        data: blob,
        status: 200,
        message: "Requirements exported successfully"
      };
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }

  // Helper method to convert requirements to CSV
  private convertToCSV(requirements: any[]): string {
    if (!requirements.length) return "No requirements to export";

    const headers = ["ID", "Title", "Description", "Status", "Priority", "Type", "Created At", "Deadline"];
    const csvRows = [headers.join(",")];

    requirements.forEach(req => {
      const row = [
        req.id || "",
        `"${(req.title || "").replace(/"/g, '""')}"`,
        `"${(req.description || "").replace(/"/g, '""')}"`,
        req.status_name || "",
        req.priority_name || "",
        req.type_name || "",
        req.created_at || "",
        req.deadline || ""
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  async importRequirements(
    projectId: number,
    file: File,
    mappings?: Record<string, string>
  ): Promise<ApiResponse<{ imported_count: number; errors: string[] }>> {
    // Since there's no import endpoint, return a placeholder response
    return {
      data: {
        imported_count: 0,
        errors: ["Import functionality not yet implemented on backend"]
      },
      status: 501,
      message: "Import not implemented"
    };
  }

  async getRequirementsByProject(
    projectId: number
  ): Promise<ApiResponse<Requirement[]>> {
    // Use the correct project requirements endpoint
    return this.client.get<Requirement[]>(`/projects/${projectId}/requirements`);
  }
}

// Export singleton instance
export const requirementsApi = new RequirementsApi();
