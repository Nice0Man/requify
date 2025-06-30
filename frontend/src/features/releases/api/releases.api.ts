import { apiClient, ApiClient, ApiResponse } from "@/shared/api/client";

// Backend-compatible release interfaces matching /backend/app/schemas/release.py
export interface Release {
  id: number;
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status: string; // Backend uses string, not enum
  planned_date?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ReleaseWithDetails extends Release {
  project_name?: string;
}

export interface ReleaseCreate {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status?: string;
  planned_date?: string;
  release_date?: string;
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  status?: string;
  planned_date?: string;
  release_date?: string;
}

export interface ReleaseListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  status?: string;
  created_by?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Transform backend array response to paginated format for frontend compatibility
export interface ReleaseListResponse {
  items: Release[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateReleaseFromRequirementsRequest {
  name: string;
  version: string;
  project_id: number;
  requirement_ids: number[];
  description?: string;
  planned_date?: string;
  release_date?: string;
  status?: string;
  auto_description?: boolean;
  include_requirement_details?: boolean;
  analyze_dependencies?: boolean;
  auto_include_dependencies?: boolean;
}

export interface GenerateSpecificationRequest {
  format?: "pdf" | "html" | "docx" | "markdown";
  language?: "ru" | "en";
  include_requirements?: boolean;
  include_relationships?: boolean;
  include_test_cases?: boolean;
  include_changelog?: boolean;
  include_statistics?: boolean;
  custom_sections?: string[];
  template_style?: "standard" | "detailed" | "compact" | "technical";
  auto_numbering?: boolean;
}

export interface SpecificationGenerationResponse {
  release_id: number;
  specification_id: number;
  specification_name: string;
  format: string;
  language: string;
  status: string;
  generated_at: string;
  generated_by?: number;
  sections: string[];
  requirements_count: number;
  relationships_count: number;
  download_url: string;
  preview_url?: string;
  generation_stats: Record<string, any>;
}

export interface PublishReleaseRequest {
  changelog?: string;
  notification_recipients?: string[];
}

export interface PublishReleaseResponse {
  release_id: number;
  status: string;
  published_at: string;
  published_by?: number;
  changelog?: string;
  notification_sent: boolean;
  recipients_count: number;
}

export interface ReleaseChangelogResponse {
  changelog: string;
  generated_at: string;
}

export interface SyncProjectRequirementsRequest {
  project_id?: number;
  requirement_ids?: number[];
}

export interface SyncProjectRequirementsResponse {
  synced_requirements: number;
  skipped_requirements: number;
  errors: string[];
  operation_summary: Record<string, any>;
}

// Release status constants (backend uses strings)
export const ReleaseStatus = {
  DRAFT: "draft",
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  TESTING: "testing",
  READY: "ready",
  PUBLISHED: "published",
  RELEASED: "released",
  CANCELLED: "cancelled",
  PLANNING: "planning",
  DELETED: "deleted", // For soft deletion
} as const;

export type ReleaseStatusType =
  (typeof ReleaseStatus)[keyof typeof ReleaseStatus];

export class ReleasesApi {
  constructor(private client = apiClient) {}

  // 1. Get Releases
  async getReleases(
    params?: ReleaseListParams
  ): Promise<ApiResponse<ReleaseListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.project_id)
      queryParams.append("project_id", params.project_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/releases/?${queryString}` : "/releases/";

    // Backend returns simple array, transform to expected format
    const response = await this.client.get<Release[]>(url);
    const releases = response.data || [];

    // Calculate pagination info
    const skip = params?.skip || 0;
    const limit = params?.limit || 100;
    const total = releases.length;
    const page = Math.floor(skip / limit) + 1;
    const pages = Math.ceil(total / limit);

    return {
      ...response,
      data: {
        items: releases,
        total,
        page,
        size: limit,
        pages,
      },
    };
  }

  // 2. Create Release
  async createRelease(
    releaseData: ReleaseCreate
  ): Promise<ApiResponse<Release>> {
    return this.client.post<Release>("/releases/", releaseData);
  }

  // 3. Get Release
  async getRelease(releaseId: number): Promise<ApiResponse<Release>> {
    return this.client.get<Release>(`/releases/${releaseId}`);
  }

  // 4. Update Release
  async updateRelease(
    releaseId: number,
    releaseData: ReleaseUpdate
  ): Promise<ApiResponse<Release>> {
    return this.client.put<Release>(`/releases/${releaseId}`, releaseData);
  }

  // 5. Soft Delete Release (mark as deleted instead of hard delete)
  async deleteRelease(
    releaseId: number
  ): Promise<ApiResponse<Release>> {
    // Instead of hard deletion, update status to "deleted"
    return this.updateRelease(releaseId, { status: ReleaseStatus.DELETED });
  }

  // 5b. Hard Delete Release (if needed for admin functions)
  async hardDeleteRelease(
    releaseId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/releases/${releaseId}`);
  }

  // 6. Create Release from Requirements
  async createReleaseFromRequirements(
    requestData: CreateReleaseFromRequirementsRequest
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(
      "/releases/create-from-requirements",
      requestData
    );
  }

  // 7. Generate Release Specification
  async generateReleaseSpecification(
    releaseId: number,
    requestData?: GenerateSpecificationRequest
  ): Promise<ApiResponse<SpecificationGenerationResponse>> {
    return this.client.post<SpecificationGenerationResponse>(
      `/releases/${releaseId}/generate-specification`,
      requestData || {}
    );
  }

  // 8. Publish Release
  async publishRelease(
    releaseId: number,
    requestData?: PublishReleaseRequest
  ): Promise<ApiResponse<PublishReleaseResponse>> {
    return this.client.post<PublishReleaseResponse>(
      `/releases/${releaseId}/publish`,
      requestData || {}
    );
  }

  // 9. Get Release Requirements
  async getReleaseRequirements(
    releaseId: number,
    params?: {
      skip?: number;
      limit?: number;
      status_id?: number;
      priority_id?: number;
      type_id?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status_id)
      queryParams.append("status_id", params.status_id.toString());
    if (params?.priority_id)
      queryParams.append("priority_id", params.priority_id.toString());
    if (params?.type_id)
      queryParams.append("type_id", params.type_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/releases/${releaseId}/requirements?${queryString}`
      : `/releases/${releaseId}/requirements`;

    return this.client.get<any[]>(url);
  }

  // 10. Get Release Changelog
  async getReleaseChangelog(
    releaseId: number
  ): Promise<ApiResponse<ReleaseChangelogResponse>> {
    return this.client.get<ReleaseChangelogResponse>(
      `/releases/${releaseId}/changelog`
    );
  }

  // 11. Sync Project Requirements to Release
  async syncProjectRequirementsToRelease(
    releaseId: number,
    params?: SyncProjectRequirementsRequest
  ): Promise<ApiResponse<SyncProjectRequirementsResponse>> {
    return this.client.post<SyncProjectRequirementsResponse>(
      `/releases/${releaseId}/sync-project-requirements`,
      params || {}
    );
  }

  // 12. Restore Release (change status from deleted back to previous status)
  async restoreRelease(
    releaseId: number,
    newStatus: string = ReleaseStatus.DRAFT
  ): Promise<ApiResponse<Release>> {
    return this.updateRelease(releaseId, { status: newStatus });
  }
}

// Export singleton instance
export const releasesApi = new ReleasesApi();
