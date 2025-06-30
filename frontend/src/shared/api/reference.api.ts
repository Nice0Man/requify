import { apiClient, ApiResponse } from "@/shared/api/client";
import {
  RequirementType,
  RequirementPriority,
  RequirementStatus,
} from "../../features/requirements/types/requirements.types";

export interface RelationshipType {
  id: number;
  name: string;
  description?: string;
  forward_label: string;
  backward_label: string;
  is_symmetric: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RequirementTypeCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface RequirementPriorityCreate {
  name: string;
  description?: string;
  level: number;
  color?: string;
  sort_order?: number;
}

export interface RequirementStatusCreate {
  name: string;
  description?: string;
  color?: string;
  is_final?: boolean;
  sort_order?: number;
  workflow_transitions?: number[];
}

export interface RelationshipTypeCreate {
  name: string;
  description?: string;
  forward_label: string;
  backward_label: string;
  is_symmetric?: boolean;
  sort_order?: number;
}

export class ReferenceApi {
  constructor(private client = apiClient) {}

  // Requirement Types
  async getRequirementTypes(): Promise<ApiResponse<RequirementType[]>> {
    return this.client.get<RequirementType[]>("/reference/requirement-types");
  }

  async createRequirementType(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<RequirementType>> {
    return this.client.post<RequirementType>("/reference/requirement-types", data);
  }

  async updateRequirementType(
    id: number,
    data: { name: string; description?: string }
  ): Promise<ApiResponse<RequirementType>> {
    return this.client.put<RequirementType>(`/reference/requirement-types/${id}`, data);
  }

  async deleteRequirementType(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/reference/requirement-types/${id}`);
  }

  // Requirement Priorities
  async getRequirementPriorities(): Promise<
    ApiResponse<RequirementPriority[]>
  > {
    return this.client.get<RequirementPriority[]>("/reference/requirement-priorities");
  }

  async createRequirementPriority(data: {
    name: string;
    description?: string;
    level?: number;
  }): Promise<ApiResponse<RequirementPriority>> {
    return this.client.post<RequirementPriority>(
      "/reference/requirement-priorities",
      data
    );
  }

  async updateRequirementPriority(
    id: number,
    data: { name: string; description?: string; level?: number }
  ): Promise<ApiResponse<RequirementPriority>> {
    return this.client.put<RequirementPriority>(
      `/reference/requirement-priorities/${id}`,
      data
    );
  }

  async deleteRequirementPriority(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/reference/requirement-priorities/${id}`
    );
  }

  // Requirement Statuses
  async getRequirementStatuses(): Promise<ApiResponse<RequirementStatus[]>> {
    return this.client.get<RequirementStatus[]>("/reference/requirement-statuses");
  }

  async createRequirementStatus(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<RequirementStatus>> {
    return this.client.post<RequirementStatus>("/reference/requirement-statuses", data);
  }

  async updateRequirementStatus(
    id: number,
    data: { name: string; description?: string }
  ): Promise<ApiResponse<RequirementStatus>> {
    return this.client.put<RequirementStatus>(
      `/reference/requirement-statuses/${id}`,
      data
    );
  }

  async deleteRequirementStatus(
    id: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/reference/requirement-statuses/${id}`
    );
  }

  // Relationship Types
  // 7. Get Relationship Types
  async getRelationshipTypes(): Promise<ApiResponse<RelationshipType[]>> {
    return this.client.get<RelationshipType[]>("/reference/relationship-types");
  }

  // 8. Create Relationship Type
  async createRelationshipType(
    relationshipData: RelationshipTypeCreate
  ): Promise<ApiResponse<RelationshipType>> {
    return this.client.post<RelationshipType>(
      "/reference/relationship-types",
      relationshipData
    );
  }

  // Convenience methods for caching and bulk operations
  async getAllReferenceData(): Promise<
    ApiResponse<{
      requirement_types: RequirementType[];
      requirement_priorities: RequirementPriority[];
      requirement_statuses: RequirementStatus[];
      relationship_types: RelationshipType[];
    }>
  > {
    // This could be implemented as a single API call or multiple parallel calls
    const [types, priorities, statuses, relationships] = await Promise.all([
      this.getRequirementTypes(),
      this.getRequirementPriorities(),
      this.getRequirementStatuses(),
      this.getRelationshipTypes(),
    ]);

    return {
      status: statuses.status,
      data: {
        requirement_types: types.data,
        requirement_priorities: priorities.data,
        requirement_statuses: statuses.data,
        relationship_types: relationships.data,
      },
    };
  }
}

// Export singleton instance
export const referenceApi = new ReferenceApi();
