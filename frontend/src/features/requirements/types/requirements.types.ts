// Requirements types based on backend contracts

export interface RequirementType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementPriority {
  id: number;
  name: string;
  description?: string;
  level: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  id: number;
  title: string;
  description: string;
  project_id: number;
  type_id: number;
  priority_id: number;
  status_id: number;
  author_id: number;
  assignee_id?: number;
  parent_id?: number;
  version: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  due_date?: string;
  // Relations
  project?: {
    id: number;
    name: string;
    code: string;
  };
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  author?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  assignee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  parent?: {
    id: number;
    title: string;
  };
  children?: Requirement[];
  relationships?: Relationship[];
  test_results?: TestResult[];
  comments?: Comment[];
}

export interface RequirementWithDetails extends Requirement {
  relationships: Relationship[];
  test_results: TestResult[];
  comments: Comment[];
  change_history: RequirementChangeHistory[];
  attachments: Attachment[];
}

export interface RequirementCreate {
  title: string;
  description: string;
  project_id: number;
  type_id: number;
  priority_id: number;
  status_id: number;
  assignee_id?: number;
  parent_id?: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
  due_date?: string;
}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  assignee_id?: number;
  parent_id?: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
  due_date?: string;
}

export interface RequirementListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  assignee_id?: number;
  author_id?: number;
  parent_id?: number;
  search?: string;
  tags?: string[];
  risk_level?: string;
  complexity?: string;
  has_parent?: boolean;
  is_overdue?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RequirementListResponse {
  items: Requirement[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RequirementSearchParams {
  query: string;
  project_id?: number;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  skip?: number;
  limit?: number;
}

export interface Relationship {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type_id: number;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Relations
  source_requirement?: {
    id: number;
    title: string;
  };
  target_requirement?: {
    id: number;
    title: string;
  };
  relationship_type?: {
    id: number;
    name: string;
    description?: string;
    is_bidirectional: boolean;
  };
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface RelationshipCreate {
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type_id: number;
  description?: string;
}

export interface RelationshipType {
  id: number;
  name: string;
  description?: string;
  is_bidirectional: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: number;
  requirement_id: number;
  test_case_id?: number;
  test_plan_id?: number;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  executed_by: number;
  executed_at: string;
  notes?: string;
  attachments?: string[];
  // Relations
  test_case?: {
    id: number;
    name: string;
    description?: string;
  };
  test_plan?: {
    id: number;
    name: string;
    version: string;
  };
  executed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface Comment {
  id: number;
  requirement_id: number;
  author_id: number;
  content: string;
  parent_id?: number;
  is_resolution?: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  author?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  parent?: Comment;
  replies?: Comment[];
}

export interface CommentCreate {
  requirement_id: number;
  content: string;
  parent_id?: number;
  is_resolution?: boolean;
}

export interface RequirementChangeHistory {
  id: number;
  requirement_id: number;
  changed_by: number;
  change_type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'deleted';
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  created_at: string;
  // Relations
  changed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface Attachment {
  id: number;
  requirement_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  description?: string;
  // Relations
  uploaded_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface RequirementStats {
  total_count: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
  by_assignee: Record<string, number>;
  overdue_count: number;
  completion_rate: number;
  average_effort: number;
  risk_distribution: Record<string, number>;
}

export interface TraceabilityMatrix {
  requirement_id: number;
  requirement_title: string;
  forward_links: {
    relationship_type: string;
    target_id: number;
    target_title: string;
  }[];
  backward_links: {
    relationship_type: string;
    source_id: number;
    source_title: string;
  }[];
  test_coverage: {
    test_count: number;
    passed_tests: number;
    failed_tests: number;
    coverage_percentage: number;
  };
}

export interface RequirementImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: {
    row: number;
    error: string;
    data?: any;
  }[];
  created_requirements: number[];
}

export interface RequirementExportParams {
  project_id?: number;
  status_ids?: number[];
  priority_ids?: number[];
  type_ids?: number[];
  include_relationships?: boolean;
  include_test_results?: boolean;
  include_comments?: boolean;
  format: 'excel' | 'csv' | 'pdf' | 'word';
}

// UI-specific types
export interface RequirementFilters {
  search: string;
  projectId: number | null;
  statusIds: number[];
  priorityIds: number[];
  typeIds: number[];
  assigneeIds: number[];
  authorIds: number[];
  riskLevels: string[];
  complexities: string[];
  tags: string[];
  hasParent: boolean | null;
  isOverdue: boolean | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface RequirementFormData extends RequirementCreate {
  // Additional UI-specific fields
  attachments?: File[];
  newTags?: string[];
}

export enum RequirementRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RequirementComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RequirementChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED = 'assigned',
  DELETED = 'deleted'
}

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  BLOCKED = 'blocked'
}

// Add this new interface to match the backend RequirementWithDetails schema
export interface RequirementDetails {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  author_id: number;
  last_modified_by: number;
  release_id?: number;
  spec_id?: number;
  created_at: string;
  updated_at: string;
  // Additional detail fields from backend
  type_name?: string;
  priority_name?: string;
  status_name?: string;
  project_name?: string;
  author_name?: string;
  last_modifier_name?: string;
  release_version?: string;
  spec_name?: string;
  tags?: string[];
} 