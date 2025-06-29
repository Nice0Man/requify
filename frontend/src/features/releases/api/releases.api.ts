import { apiClient, ApiClient, ApiResponse } from "@/shared/api/client";

export interface Release {
  type: string;
  requirements: never[];
  change_log: never[];
  dependencies: never[];
  completion_percentage: number;
  project_name: string;
  created_by_name: string;
  id: number;
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status: ReleaseStatus;
  planned_date?: string;
  actual_date?: string;
  created_by: number;
  requirements_ids: number[];
  changelog?: string;
  release_notes?: string;
  created_at: string;
  updated_at: string;
  updated_by: number;
  updated_by_name: string;
  artifacts: never[];
  approvals: never[];
}

export interface ReleaseCreate {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status?: ReleaseStatus;
  planned_date?: string;
  requirements_ids?: number[];
  release_notes?: string;
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  status?: ReleaseStatus;
  planned_date?: string;
  actual_date?: string;
  requirements_ids?: number[];
  changelog?: string;
  release_notes?: string;
}

export interface ReleaseListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  status?: ReleaseStatus;
  created_by?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

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
  release_notes?: string;
}

export interface GenerateSpecificationRequest {
  format?: "pdf" | "html" | "docx";
  include_requirements?: boolean;
  include_test_results?: boolean;
  include_changelog?: boolean;
}

export interface PublishReleaseRequest {
  changelog?: string;
  notification_recipients?: string[];
}

export enum ReleaseStatus {
  DRAFT = "draft",
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  READY = "ready",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
  PLANNING = "PLANNING",
  RELEASED = "RELEASED",
}

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

    return this.client.get<ReleaseListResponse>(url);
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

  // 5. Delete Release
  async deleteRelease(
    releaseId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/releases/${releaseId}`);
  }

  // 6. Create Release from Requirements
  async createReleaseFromRequirements(
    requestData: CreateReleaseFromRequirementsRequest
  ): Promise<ApiResponse<Release>> {
    return this.client.post<Release>(
      "/releases/create-from-requirements",
      requestData
    );
  }

  // 7. Generate Release Specification
  async generateReleaseSpecification(
    releaseId: number,
    requestData?: GenerateSpecificationRequest
  ): Promise<ApiResponse<{ document_url: string; format: string }>> {
    return this.client.post<{ document_url: string; format: string }>(
      `/releases/${releaseId}/generate-specification`,
      requestData || {}
    );
  }

  // 8. Publish Release
  async publishRelease(
    releaseId: number,
    requestData?: PublishReleaseRequest
  ): Promise<ApiResponse<Release>> {
    return this.client.post<Release>(
      `/releases/${releaseId}/publish`,
      requestData || {}
    );
  }

  // 9. Get Release Requirements
  async getReleaseRequirements(
    releaseId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/releases/${releaseId}/requirements?${queryString}`
      : `/releases/${releaseId}/requirements`;

    return this.client.get<any>(url);
  }

  // 10. Get Release Changelog
  async getReleaseChangelog(
    releaseId: number
  ): Promise<ApiResponse<{ changelog: string; generated_at: string }>> {
    return this.client.get<{ changelog: string; generated_at: string }>(
      `/releases/${releaseId}/changelog`
    );
  }
}

// Export singleton instance
export const releasesApi = new ReleasesApi();
