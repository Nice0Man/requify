import { apiClient, ApiResponse } from "@/shared/api/client";
import type {
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RelationshipType,
  RequirementTypeCreate,
  RequirementPriorityCreate,
  RequirementStatusCreate,
  RelationshipTypeCreate,
} from "@/shared/types/api";

export class ReferenceApi {
  constructor(private client = apiClient) {}

  // Requirement Types
  async getRequirementTypes(): Promise<ApiResponse<RequirementType[]>> {
    return this.client.get<RequirementType[]>("/api/v1/reference/requirement-types/");
  }

  async createRequirementType(data: RequirementTypeCreate): Promise<ApiResponse<RequirementType>> {
    return this.client.post<RequirementType>("/reference/requirement-types", data);
  }

  async updateRequirementType(
    id: number,
    data: Partial<RequirementTypeCreate>
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
    return this.client.get<RequirementPriority[]>("/api/v1/reference/requirement-priorities/");
  }

  async createRequirementPriority(data: RequirementPriorityCreate): Promise<ApiResponse<RequirementPriority>> {
    return this.client.post<RequirementPriority>(
      "/reference/requirement-priorities",
      data
    );
  }

  async updateRequirementPriority(
    id: number,
    data: Partial<RequirementPriorityCreate>
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
    return this.client.get<RequirementStatus[]>("/api/v1/reference/requirement-statuses/");
  }

  async createRequirementStatus(data: RequirementStatusCreate): Promise<ApiResponse<RequirementStatus>> {
    return this.client.post<RequirementStatus>("/reference/requirement-statuses", data);
  }

  async updateRequirementStatus(
    id: number,
    data: Partial<RequirementStatusCreate>
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
  async getRelationshipTypes(): Promise<ApiResponse<RelationshipType[]>> {
    return this.client.get<RelationshipType[]>("/api/v1/reference/relationship-types/");
  }

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
