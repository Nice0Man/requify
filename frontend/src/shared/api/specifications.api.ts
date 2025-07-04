import { apiClient, ApiResponse } from "@/shared/api/client";
import {
  Specification,
  SpecificationCreate,
  SpecificationUpdate,
  SpecificationRequirement,
  GenerateDocumentRequest,
  GenerateDocumentResponse,
  SpecificationStatus,
} from "@/shared/types/api";

export interface SpecificationListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  release_id?: number;
  status?: SpecificationStatus;
  created_by?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SpecificationListResponse {
  items: Specification[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class SpecificationsApi {
  constructor(private client = apiClient) {}

  // 1. Get Specifications
  async getSpecifications(
    params?: SpecificationListParams
  ): Promise<ApiResponse<SpecificationListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.project_id)
      queryParams.append("project_id", params.project_id.toString());
    if (params?.release_id)
      queryParams.append("release_id", params.release_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/specifications/?${queryString}`
      : "/specifications/";

    return this.client.get<SpecificationListResponse>(url);
  }

  // 2. Create Specification
  async createSpecification(
    specData: SpecificationCreate
  ): Promise<ApiResponse<Specification>> {
    return this.client.post<Specification>("/specifications/", specData);
  }

  // 3. Get Specification
  async getSpecification(specId: number): Promise<ApiResponse<Specification>> {
    return this.client.get<Specification>(`/specifications/${specId}`);
  }

  // 4. Update Specification
  async updateSpecification(
    specId: number,
    specData: SpecificationUpdate
  ): Promise<ApiResponse<Specification>> {
    return this.client.put<Specification>(
      `/specifications/${specId}`,
      specData
    );
  }

  // 5. Delete Specification
  async deleteSpecification(
    specId: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/specifications/${specId}`);
  }

  // 6. Get Specification Requirements
  async getSpecificationRequirements(
    specId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<
    ApiResponse<{ items: SpecificationRequirement[]; total: number }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/specifications/${specId}/requirements?${queryString}`
      : `/specifications/${specId}/requirements`;

    return this.client.get<{
      items: SpecificationRequirement[];
      total: number;
    }>(url);
  }

  // 7. Generate Specification Document
  async generateSpecificationDocument(
    specId: number,
    request: GenerateDocumentRequest
  ): Promise<ApiResponse<GenerateDocumentResponse>> {
    return this.client.post<GenerateDocumentResponse>(
      `/specifications/${specId}/generate-document`,
      request
    );
  }

  // Additional helper methods
  async approveSpecification(
    specId: number
  ): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, {
      status: SpecificationStatus.APPROVED,
    });
  }

  async publishSpecification(
    specId: number
  ): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, {
      status: SpecificationStatus.PUBLISHED,
    });
  }

  async archiveSpecification(
    specId: number
  ): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, {
      status: SpecificationStatus.ARCHIVED,
    });
  }
}

// Export singleton instance
export const specificationsApi = new SpecificationsApi();
