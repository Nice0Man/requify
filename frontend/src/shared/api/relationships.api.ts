import { apiClient, ApiResponse } from "@/shared/api/client";

export interface Relationship {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type_id: number;
  description?: string;
  created_by: number;
  validated: boolean;
  validation_notes?: string;
  created_at: string;
  updated_at: string;
  // Expanded data from joins
  source_requirement_title?: string;
  target_requirement_title?: string;
  relationship_type_name?: string;
  relationship_forward_label?: string;
  relationship_backward_label?: string;
}

export interface RelationshipCreate {
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type_id: number;
  description?: string;
}

export interface RelationshipUpdate {
  relationship_type_id?: number;
  description?: string;
  validated?: boolean;
  validation_notes?: string;
}

export interface RelationshipListParams {
  skip?: number;
  limit?: number;
  source_requirement_id?: number;
  target_requirement_id?: number;
  relationship_type_id?: number;
  validated?: boolean;
  created_by?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface RelationshipListResponse {
  items: Relationship[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface RequirementDependency {
  requirement_id: number;
  requirement_title: string;
  relationship_type: string;
  relationship_direction: "incoming" | "outgoing";
  depth: number;
  path: number[];
  is_circular: boolean;
}

export interface TraceMatrixEntry {
  source_requirement_id: number;
  source_requirement_title: string;
  target_requirement_id: number;
  target_requirement_title: string;
  relationship_type: string;
  relationship_path: string;
  depth: number;
  is_direct: boolean;
}

export interface TraceMatrix {
  requirement_id: number;
  requirement_title: string;
  upstream_traces: TraceMatrixEntry[];
  downstream_traces: TraceMatrixEntry[];
  coverage_percentage: number;
  orphan_status: "none" | "orphan" | "island";
}

export class RelationshipsApi {
  constructor(private client = apiClient) {}

  // 1. Get Relationships
  async getRelationships(
    params?: RelationshipListParams
  ): Promise<ApiResponse<RelationshipListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.source_requirement_id)
      queryParams.append(
        "source_requirement_id",
        params.source_requirement_id.toString()
      );
    if (params?.target_requirement_id)
      queryParams.append(
        "target_requirement_id",
        params.target_requirement_id.toString()
      );
    if (params?.relationship_type_id)
      queryParams.append(
        "relationship_type_id",
        params.relationship_type_id.toString()
      );
    if (params?.validated !== undefined)
      queryParams.append("validated", params.validated.toString());
    if (params?.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/relationships/?${queryString}`
      : "/relationships/";

    return this.client.get<RelationshipListResponse>(url);
  }

  // 2. Create Relationship
  async createRelationship(
    relationshipData: RelationshipCreate
  ): Promise<ApiResponse<Relationship>> {
    return this.client.post<Relationship>("/relationships/", relationshipData);
  }

  // 3. Get Relationship
  async getRelationship(
    relationshipId: number
  ): Promise<ApiResponse<Relationship>> {
    return this.client.get<Relationship>(`/relationships/${relationshipId}`);
  }

  // 4. Update Relationship
  async updateRelationship(
    relationshipId: number,
    relationshipData: RelationshipUpdate
  ): Promise<ApiResponse<Relationship>> {
    return this.client.put<Relationship>(
      `/relationships/${relationshipId}`,
      relationshipData
    );
  }

  // 5. Delete Relationship
  async deleteRelationship(
    relationshipId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(
      `/relationships/${relationshipId}`
    );
  }

  // 6. Get Requirement Relationships
  async getRequirementRelationships(
    requirementId: number,
    params?: {
      skip?: number;
      limit?: number;
      direction?: "all" | "incoming" | "outgoing";
    }
  ): Promise<ApiResponse<{ items: Relationship[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.direction) queryParams.append("direction", params.direction);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/relationships/requirements/${requirementId}/relationships?${queryString}`
      : `/relationships/requirements/${requirementId}/relationships`;

    return this.client.get<{ items: Relationship[]; total: number }>(url);
  }

  // 7. Create Requirement Relationship
  async createRequirementRelationship(
    requirementId: number,
    relationshipData: Omit<RelationshipCreate, "source_requirement_id">
  ): Promise<ApiResponse<Relationship>> {
    const fullRelationshipData: RelationshipCreate = {
      source_requirement_id: requirementId,
      ...relationshipData,
    };
    return this.client.post<Relationship>(
      `/relationships/requirements/${requirementId}/relationships`,
      fullRelationshipData
    );
  }

  // 8. Get Requirement Dependencies
  async getRequirementDependencies(
    requirementId: number,
    params?: { max_depth?: number; include_circular?: boolean }
  ): Promise<
    ApiResponse<{
      dependencies: RequirementDependency[];
      has_circular: boolean;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.max_depth)
      queryParams.append("max_depth", params.max_depth.toString());
    if (params?.include_circular !== undefined)
      queryParams.append(
        "include_circular",
        params.include_circular.toString()
      );

    const queryString = queryParams.toString();
    const url = queryString
      ? `/relationships/requirements/${requirementId}/dependencies?${queryString}`
      : `/relationships/requirements/${requirementId}/dependencies`;

    return this.client.get<{
      dependencies: RequirementDependency[];
      has_circular: boolean;
    }>(url);
  }

  // 9. Get Requirement Dependents
  async getRequirementDependents(
    requirementId: number,
    params?: { max_depth?: number }
  ): Promise<ApiResponse<{ dependents: RequirementDependency[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.max_depth)
      queryParams.append("max_depth", params.max_depth.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/relationships/requirements/${requirementId}/dependents?${queryString}`
      : `/relationships/requirements/${requirementId}/dependents`;

    return this.client.get<{ dependents: RequirementDependency[] }>(url);
  }

  // 10. Get Requirement Trace Matrix
  async getRequirementTraceMatrix(
    requirementId: number,
    params?: { include_indirect?: boolean; max_depth?: number }
  ): Promise<ApiResponse<TraceMatrix>> {
    const queryParams = new URLSearchParams();
    if (params?.include_indirect !== undefined)
      queryParams.append(
        "include_indirect",
        params.include_indirect.toString()
      );
    if (params?.max_depth)
      queryParams.append("max_depth", params.max_depth.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/relationships/requirements/${requirementId}/trace-matrix?${queryString}`
      : `/relationships/requirements/${requirementId}/trace-matrix`;

    return this.client.get<TraceMatrix>(url);
  }

  // Additional helper methods
  async validateRelationship(
    relationshipId: number,
    validationNotes?: string
  ): Promise<ApiResponse<Relationship>> {
    return this.updateRelationship(relationshipId, {
      validated: true,
      validation_notes: validationNotes,
    });
  }

  async invalidateRelationship(
    relationshipId: number,
    validationNotes?: string
  ): Promise<ApiResponse<Relationship>> {
    return this.updateRelationship(relationshipId, {
      validated: false,
      validation_notes: validationNotes,
    });
  }

  // Bulk operations
  async bulkCreateRelationships(
    relationships: RelationshipCreate[]
  ): Promise<ApiResponse<{ created: number; errors: any[] }>> {
    return this.client.post<{ created: number; errors: any[] }>(
      "/relationships/bulk",
      { relationships }
    );
  }

  async bulkDeleteRelationships(
    relationshipIds: number[]
  ): Promise<ApiResponse<{ deleted: number; errors: any[] }>> {
    return this.client.delete<{ deleted: number; errors: any[] }>(
      "/relationships/bulk",
      { data: { relationship_ids: relationshipIds } }
    );
  }
}

// Export singleton instance
export const relationshipsApi = new RelationshipsApi();
