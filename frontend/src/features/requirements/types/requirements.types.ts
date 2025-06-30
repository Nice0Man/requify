// Requirements types that exactly match backend schemas

// ===== Reference Data Types =====

export interface RequirementType {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementTypeCreate {
  name: string;
  description?: string;
}

export interface RequirementPriority {
  id: number;
  name: string;
  description?: string;
  level?: number;
}

export interface RequirementPriorityCreate {
  name: string;
  description?: string;
  level?: number;
}

export interface RequirementStatus {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementStatusCreate {
  name: string;
  description?: string;
}

// ===== Requirement Types =====

export interface RequirementBase {
  title: string;
  description?: string;
  deadline?: string; // ISO datetime string
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
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  release_id?: number;
  spec_id?: number;
}

export interface Requirement extends RequirementBase {
  id: number;
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
}

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

// ===== API Response Types =====

export interface RequirementListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  assigned_to?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface RequirementListResponse {
  items: Requirement[];
  total: number;
}

export interface RequirementSearchParams {
  project_id?: number;
  status_id?: number;
  type_id?: number;
  priority_id?: number;
  search?: string;
}

// ===== Status Change =====

export interface RequirementStatusChange {
  status_id: number;
  reason?: string;
}

// ===== Relationship Types =====

export interface RequirementRelationship {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type: string;
  description?: string;
  created_by: number;
  created_at: string;
}

export interface RequirementRelationshipCreate {
  target_requirement_id: number;
  relationship_type: string;
}

// ===== Comment Types =====

export interface RequirementComment {
  id: number;
  requirement_id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// ===== UI State Types =====

export interface RequirementFilters {
  search: string;
  projectId: number | null;
  statusIds: number[];
  priorityIds: number[];
  typeIds: number[];
  assigneeIds: number[];
  authorIds: number[];
  hasParent: boolean | null;
  isOverdue: boolean | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface RequirementFormData extends RequirementCreate {
  // Additional UI-specific fields if needed
}

// ===== Error Types =====

export interface RequirementValidationError {
  [field: string]: string;
}

export interface RequirementApiError {
  detail:
    | string
    | Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
        input?: any;
      }>;
  error?: string;
  error_description?: string;
}

// ===== Requirement Stats =====

export interface RequirementStats {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
}

// ===== Requirement Group =====

export interface RequirementGroup {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementGroupCreate {
  name: string;
  description?: string;
}

export interface RequirementGroupUpdate {
  name?: string;
  description?: string;
}

// ===== Requirement Group Order =====
export interface RequirementGroupOrder {
  id: number;
  order_index: number;
}
