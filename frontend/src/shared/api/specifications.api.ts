import { apiClient, ApiClient, ApiResponse } from '@/shared/api/client';

export interface Specification {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  release_id?: number;
  version: string;
  status: SpecificationStatus;
  template_id?: number;
  document_format: DocumentFormat;
  content?: string;
  requirements_count: number;
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  published_at?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SpecificationCreate {
  title: string;
  description?: string;
  project_id: number;
  release_id?: number;
  version: string;
  template_id?: number;
  document_format?: DocumentFormat;
  content?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SpecificationUpdate {
  title?: string;
  description?: string;
  version?: string;
  status?: SpecificationStatus;
  template_id?: number;
  document_format?: DocumentFormat;
  content?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SpecificationListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  release_id?: number;
  status?: SpecificationStatus;
  created_by?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SpecificationListResponse {
  items: Specification[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SpecificationRequirement {
  id: number;
  requirement_id: number;
  specification_id: number;
  section: string;
  order_index: number;
  include_children: boolean;
  custom_content?: string;
  requirement_title: string;
  requirement_description: string;
  requirement_status: string;
  requirement_priority: string;
}

export interface GenerateDocumentRequest {
  format: DocumentFormat;
  template_id?: number;
  include_toc: boolean;
  include_appendices: boolean;
  include_requirement_details: boolean;
  include_test_cases: boolean;
  include_traceability_matrix: boolean;
  custom_sections?: string[];
  watermark?: string;
}

export interface GenerateDocumentResponse {
  document_id: string;
  download_url: string;
  format: DocumentFormat;
  file_size: number;
  generated_at: string;
  expires_at: string;
}

export enum SpecificationStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html',
  MARKDOWN = 'markdown'
}

export class SpecificationsApi {
  constructor(private client = apiClient) {}

  // 1. Get Specifications
  async getSpecifications(params?: SpecificationListParams): Promise<ApiResponse<SpecificationListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.release_id) queryParams.append('release_id', params.release_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.created_by) queryParams.append('created_by', params.created_by.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/specifications/?${queryString}` : '/specifications/';
    
    return this.client.get<SpecificationListResponse>(url);
  }

  // 2. Create Specification
  async createSpecification(specData: SpecificationCreate): Promise<ApiResponse<Specification>> {
    return this.client.post<Specification>('/specifications/', specData);
  }

  // 3. Get Specification
  async getSpecification(specId: number): Promise<ApiResponse<Specification>> {
    return this.client.get<Specification>(`/specifications/${specId}`);
  }

  // 4. Update Specification
  async updateSpecification(specId: number, specData: SpecificationUpdate): Promise<ApiResponse<Specification>> {
    return this.client.put<Specification>(`/specifications/${specId}`, specData);
  }

  // 5. Delete Specification
  async deleteSpecification(specId: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/specifications/${specId}`);
  }

  // 6. Get Specification Requirements
  async getSpecificationRequirements(specId: number, params?: { skip?: number; limit?: number }): Promise<ApiResponse<{ items: SpecificationRequirement[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/specifications/${specId}/requirements?${queryString}` : `/specifications/${specId}/requirements`;
    
    return this.client.get<{ items: SpecificationRequirement[]; total: number }>(url);
  }

  // 7. Generate Specification Document
  async generateSpecificationDocument(specId: number, request: GenerateDocumentRequest): Promise<ApiResponse<GenerateDocumentResponse>> {
    return this.client.post<GenerateDocumentResponse>(`/specifications/${specId}/generate-document`, request);
  }

  // Additional helper methods
  async approveSpecification(specId: number): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, { status: SpecificationStatus.APPROVED });
  }

  async publishSpecification(specId: number): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, { status: SpecificationStatus.PUBLISHED });
  }

  async archiveSpecification(specId: number): Promise<ApiResponse<Specification>> {
    return this.updateSpecification(specId, { status: SpecificationStatus.ARCHIVED });
  }
}

// Export singleton instance
export const specificationsApi = new SpecificationsApi(); 