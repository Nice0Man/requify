// =============================================================================
// Requirement Base Types
// =============================================================================

export interface RequirementBase {
  title: string;
  description?: string;
  deadline?: string; // ISO datetime string
}

export interface Requirement extends RequirementBase {
  id: number;
  code?: string;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  created_by: number;
  assigned_to?: number;
  release_id?: number;
  created_at: string;
  updated_at: string;
  version: number;
  // Extended fields for UI compatibility
  status?: string;
  priority?: string;
  type?: string;
  author_name?: string;
  assignee_name?: string;
  project_name?: string;
}

export interface RequirementCreate extends RequirementBase {
  type_id: number;
  priority_id: number;
  project_id: number;
  assigned_to?: number;
  release_id?: number;
  code?: string;
}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  assigned_to?: number;
  release_id?: number;
  deadline?: string;
  code?: string;
}

export interface RequirementWithDetails extends Requirement {
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  created_by_user?: {
    id: number;
    username: string;
    email: string;
  };
  assigned_to_user?: {
    id: number;
    username: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    code: string;
  };
  release?: {
    id: number;
    name: string;
    version: string;
  };
  comments_count?: number;
  relationships_count?: number;
  test_cases_count?: number;
}

export interface RequirementWithTestResults extends RequirementWithDetails {
  test_results?: Array<{
    id: number;
    test_case_id: number;
    status: string;
    execution_date: string;
    notes?: string;
  }>;
  test_coverage?: number;
  test_status?: 'not_tested' | 'in_progress' | 'passed' | 'failed' | 'blocked';
}

// =============================================================================
// Reference Types
// =============================================================================

export interface RequirementType {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementPriority {
  id: number;
  name: string;
  description?: string;
  level?: number;
}

export interface RequirementStatus {
  id: number;
  name: string;
  description?: string;
}

// =============================================================================
// Relationship Types
// =============================================================================

export interface Relationship {
  id: number;
  source_id: number;
  target_id: number;
  type_id: number;
  created_at: string;
  created_by: number;
}

export interface RelationshipCreate {
  source_id: number;
  target_id: number;
  type_id: number;
}

export interface RelationshipCreateForRequirement {
  target_id: number;
  type_id: number;
}

export interface RelationshipUpdate {
  type_id?: number;
}

export interface RelationshipWithDetails extends Relationship {
  type?: RelationshipType;
  source_requirement?: {
    id: number;
    title: string;
    code?: string;
  };
  target_requirement?: {
    id: number;
    title: string;
    code?: string;
  };
  created_by_user?: {
    id: number;
    username: string;
  };
}

export interface RelationshipType {
  id: number;
  name: string;
  description?: string;
  inverse_name?: string;
}

// =============================================================================
// Dashboard and Quick Types
// =============================================================================

export interface QuickRequirement {
  id: number;
  title: string;
  code?: string;
  status: string;
  priority: string;
  project_name: string;
  updated_at: string;
}

// =============================================================================
// Trace Matrix Types
// =============================================================================

export interface TraceNode {
  id: number;
  title: string;
  code?: string;
  type: string;
  level: number;
  children?: TraceNode[];
}

export interface TraceLink {
  source_id: number;
  target_id: number;
  type: string;
  relationship_id: number;
}

export interface TraceMatrix {
  nodes: TraceNode[];
  links: TraceLink[];
  coverage_stats: {
    total_requirements: number;
    traced_requirements: number;
    coverage_percentage: number;
  };
}

// =============================================================================
// Comment Types
// =============================================================================

export interface Comment {
  id: number;
  content: string;
  requirement_id: number;
  created_by: number;
  created_at: string;
  updated_at?: string;
}

export interface CommentCreateForRequirement {
  content: string;
}

export interface CommentUpdate {
  content: string;
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}
