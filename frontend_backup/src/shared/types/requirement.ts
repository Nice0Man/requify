/**
 * Requirement Types
 * Основано на схемах из backend/app/schemas/requirement.py
 */

// === Base Requirement Types ===

export interface RequirementBase {
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
}

export interface RequirementCreate extends RequirementBase {
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  release_id?: number;
  spec_id?: number;
}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  progress?: number;
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  release_id?: number;
  spec_id?: number;
}

export interface RequirementInDBBase extends RequirementBase {
  id: number;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  author_id: number;
  last_modified_by: number;
  release_id?: number;
  spec_id?: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Requirement extends RequirementInDBBase {}

export interface RequirementWithDetails extends Requirement {
  type_name?: string;
  priority_name?: string;
  status_name?: string;
  project_name?: string;
  author_name?: string;
  last_modifier_name?: string;
  release_version?: string;
  spec_name?: string;
}

export interface RequirementWithTestResults extends Requirement {
  latest_test_status?: string;
  test_count: number;
  tests_passed: number;
}

export interface RequirementInDB extends RequirementInDBBase {}

// === Requirement Metadata Types ===

export interface RequirementType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export interface RequirementPriority {
  id: number;
  name: string;
  level: number;
  color?: string;
  description?: string;
  is_active: boolean;
}

export interface RequirementStatus {
  id: number;
  name: string;
  category: 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
  color?: string;
  description?: string;
  is_final: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface RequirementSpec {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  version: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// === API Response Types ===

export interface RequirementListResponse {
  requirements: RequirementWithDetails[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface RequirementDetailResponse extends RequirementWithDetails {
  comments?: RequirementComment[];
  attachments?: RequirementAttachment[];
  related_requirements?: Pick<Requirement, 'id' | 'title' | 'status_id'>[];
  test_cases?: RequirementTestCase[];
  change_history?: RequirementChangeHistory[];
}

// === Requirement Filter & Search Types ===

export interface RequirementFilter {
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  project_id?: number;
  author_id?: number;
  release_id?: number;
  spec_id?: number;
  created_after?: string;
  created_before?: string;
  deadline_after?: string;
  deadline_before?: string;
  progress_min?: number;
  progress_max?: number;
  search?: string;
  has_deadline?: boolean;
  is_overdue?: boolean;
}

export interface RequirementSortOptions {
  field: 'title' | 'created_at' | 'updated_at' | 'deadline' | 'progress' | 'priority_id' | 'status_id';
  direction: 'asc' | 'desc';
}

export interface RequirementQueryParams extends RequirementFilter {
  page?: number;
  per_page?: number;
  sort?: RequirementSortOptions;
  include_details?: boolean;
  include_test_results?: boolean;
}

// === Requirement Management Types ===

export interface RequirementBulkOperation {
  requirement_ids: number[];
  operation: 'update_status' | 'update_priority' | 'update_type' | 'assign_release' | 'delete' | 'archive';
  data?: {
    status_id?: number;
    priority_id?: number;
    type_id?: number;
    release_id?: number;
  };
}

export interface RequirementImportData {
  requirements: RequirementCreate[];
  project_id: number;
  default_type_id?: number;
  default_priority_id?: number;
  default_status_id?: number;
}

export interface RequirementExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf' | 'docx';
  fields: string[];
  filter?: RequirementFilter;
  include_details?: boolean;
  include_comments?: boolean;
  include_attachments?: boolean;
}

// === Requirement Comments Types ===

export interface RequirementComment {
  id: number;
  requirement_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_internal: boolean;
  parent_id?: number;
}

export interface RequirementCommentCreate {
  requirement_id: number;
  content: string;
  is_internal?: boolean;
  parent_id?: number;
}

export interface RequirementCommentUpdate {
  content?: string;
  is_internal?: boolean;
}

// === Requirement Attachments Types ===

export interface RequirementAttachment {
  id: number;
  requirement_id: number;
  user_id: number;
  user_name: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  description?: string;
  uploaded_at: string;
}

export interface RequirementAttachmentUpload {
  requirement_id: number;
  file: File;
  description?: string;
}

// === Requirement Test Cases Types ===

export interface RequirementTestCase {
  id: number;
  requirement_id: number;
  title: string;
  description?: string;
  steps: string;
  expected_result: string;
  status: 'draft' | 'ready' | 'passed' | 'failed' | 'blocked' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: number;
  created_at: string;
  updated_at: string;
}

// === Requirement Change History Types ===

export interface RequirementChangeHistory {
  id: number;
  requirement_id: number;
  user_id: number;
  user_name: string;
  action: 'create' | 'update' | 'status_change' | 'priority_change' | 'assignment';
  field_name?: string;
  old_value?: string;
  new_value?: string;
  comment?: string;
  timestamp: string;
}

// === Requirement Relations Types ===

export interface RequirementRelation {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relation_type: 'depends_on' | 'blocks' | 'related_to' | 'parent_of' | 'child_of' | 'duplicate_of';
  created_by: number;
  created_at: string;
}

export interface RequirementRelationCreate {
  source_requirement_id: number;
  target_requirement_id: number;
  relation_type: 'depends_on' | 'blocks' | 'related_to' | 'parent_of' | 'child_of' | 'duplicate_of';
}

// === Requirement Validation Types ===

export interface RequirementValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RequirementValidationResult {
  valid: boolean;
  errors: RequirementValidationError[];
  warnings?: RequirementValidationError[];
}

// === Requirement Statistics Types ===

export interface RequirementStatistics {
  project_id: number;
  total_requirements: number;
  requirements_by_status: Record<string, number>;
  requirements_by_priority: Record<string, number>;
  requirements_by_type: Record<string, number>;
  completion_percentage: number;
  overdue_requirements: number;
  upcoming_deadlines: number;
  avg_completion_time: number;
  test_coverage: number;
}

// === Requirement Dashboard Types ===

export interface RequirementDashboard {
  statistics: RequirementStatistics;
  recent_requirements: RequirementWithDetails[];
  my_requirements: RequirementWithDetails[];
  overdue_requirements: RequirementWithDetails[];
  upcoming_deadlines: RequirementWithDetails[];
  recent_comments: RequirementComment[];
  status_distribution: Array<{
    status_name: string;
    count: number;
    percentage: number;
    color?: string;
  }>;
}

// === Form Data Types ===

export interface RequirementFormData {
  title: string;
  description?: string;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  release_id?: number;
  spec_id?: number;
  deadline?: string;
  progress: number;
}

export interface RequirementEditFormData {
  title?: string;
  description?: string;
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  release_id?: number;
  spec_id?: number;
  deadline?: string;
  progress?: number;
}

// === Search and Filter Form Types ===

export interface RequirementSearchFormData {
  search?: string;
  type_ids?: number[];
  priority_ids?: number[];
  status_ids?: number[];
  author_ids?: number[];
  release_ids?: number[];
  spec_ids?: number[];
  date_from?: string;
  date_to?: string;
  deadline_from?: string;
  deadline_to?: string;
  progress_from?: number;
  progress_to?: number;
  has_deadline?: boolean;
  is_overdue?: boolean;
}

// === Utility Types ===

export type RequirementMinimalInfo = Pick<Requirement, 'id' | 'title' | 'status_id'>;

export type RequirementPublicInfo = Pick<RequirementWithDetails, 'id' | 'title' | 'status_name' | 'priority_name' | 'progress'>;

export type RequirementSummary = Pick<RequirementWithDetails, 'id' | 'title' | 'description' | 'status_name' | 'priority_name' | 'type_name' | 'progress' | 'deadline'>;

// === Template Types ===

export interface RequirementTemplate {
  id: number;
  name: string;
  description?: string;
  title_template: string;
  description_template?: string;
  default_type_id: number;
  default_priority_id: number;
  default_status_id: number;
  project_id?: number;
  created_by: number;
  created_at: string;
  is_public: boolean;
}

export interface RequirementTemplateCreate {
  name: string;
  description?: string;
  title_template: string;
  description_template?: string;
  default_type_id: number;
  default_priority_id: number;
  default_status_id: number;
  project_id?: number;
  is_public?: boolean;
}

export interface RequirementFromTemplate {
  template_id: number;
  project_id: number;
  title?: string;
  description?: string;
  variables?: Record<string, string>;
}

// === Requirement Workflow Types ===

export interface RequirementWorkflowTransition {
  id: number;
  from_status_id: number;
  to_status_id: number;
  name: string;
  description?: string;
  requires_approval: boolean;
  allowed_roles: string[];
  conditions?: Record<string, unknown>;
}

export interface RequirementApproval {
  id: number;
  requirement_id: number;
  approver_id: number;
  approver_name: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementApprovalRequest {
  requirement_id: number;
  approver_ids: number[];
  comment?: string;
  due_date?: string;
}

// === Notification Types ===

export interface RequirementNotification {
  id: number;
  requirement_id: number;
  user_id: number;
  type: 'status_change' | 'assignment' | 'comment' | 'deadline_approaching' | 'overdue';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// === Integration Types ===

export interface RequirementIntegration {
  id: number;
  requirement_id: number;
  external_system: string;
  external_id: string;
  sync_status: 'pending' | 'synced' | 'error';
  last_sync: string;
  sync_data?: Record<string, unknown>;
} 