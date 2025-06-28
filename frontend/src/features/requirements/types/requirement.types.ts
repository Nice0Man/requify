// Requirements types based on backend contracts

export interface Requirement {
  id: number;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  type: RequirementType;
  project_id: number;
  project_name?: string;
  group_id?: number;
  group_name?: string;
  parent_id?: number;
  children_ids: number[];
  tags: string[];
  estimated_effort?: number;
  actual_effort?: number;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by: number;
  created_by_name?: string;
  updated_by: number;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  version: number;
  custom_fields?: Record<string, any>;
}

export interface RequirementCreate {
  title: string;
  description?: string;
  acceptance_criteria?: string;
  priority: RequirementPriority;
  status?: RequirementStatus;
  type: RequirementType;
  project_id: number;
  group_id?: number;
  parent_id?: number;
  tags?: string[];
  estimated_effort?: number;
  assigned_to?: number;
  custom_fields?: Record<string, any>;
}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  acceptance_criteria?: string;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  type?: RequirementType;
  group_id?: number;
  parent_id?: number;
  tags?: string[];
  estimated_effort?: number;
  actual_effort?: number;
  assigned_to?: number;
  custom_fields?: Record<string, any>;
}

export enum RequirementPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RequirementStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  TESTING = 'testing',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum RequirementType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non_functional',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  USER_STORY = 'user_story',
  EPIC = 'epic'
}

export interface RequirementGroup {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  color?: string;
  order_index: number;
  requirements_count: number;
  created_at: string;
  updated_at: string;
}

export interface RequirementGroupCreate {
  name: string;
  description?: string;
  project_id: number;
  color?: string;
  order_index?: number;
}

export interface RequirementGroupUpdate {
  name?: string;
  description?: string;
  color?: string;
  order_index?: number;
}

export interface RequirementRelationship {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type: RelationshipType;
  description?: string;
  created_by: number;
  created_at: string;
}

export enum RelationshipType {
  DEPENDS_ON = 'depends_on',
  BLOCKS = 'blocks',
  RELATES_TO = 'relates_to',
  DUPLICATES = 'duplicates',
  CHILD_OF = 'child_of',
  PARENT_OF = 'parent_of'
}

export interface RequirementComment {
  id: number;
  requirement_id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementHistory {
  id: number;
  requirement_id: number;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_by: number;
  changed_by_name: string;
  changed_at: string;
}

export interface RequirementFilters {
  project_id?: number;
  group_id?: number;
  status?: RequirementStatus[];
  priority?: RequirementPriority[];
  type?: RequirementType[];
  assigned_to?: number[];
  created_by?: number[];
  search?: string;
  tags?: string[];
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  has_children?: boolean;
  parent_id?: number;
}

export interface RequirementListParams {
  project_id: any;
  status_id: any;
  type_id: any;
  priority_id: any;
  assigned_to: any;
  skip?: number;
  limit?: number;
  filters?: RequirementFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RequirementListResponse {
  items: Requirement[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface RequirementWithRelations extends Requirement {
  relationships: RequirementRelationship[];
  comments: RequirementComment[];
  history: RequirementHistory[];
  test_cases: Array<{
    id: number;
    title: string;
    status: string;
  }>;
}

export interface RequirementStats {
  total: number;
  by_status: Record<RequirementStatus, number>;
  by_priority: Record<RequirementPriority, number>;
  by_type: Record<RequirementType, number>;
  by_assignee: Record<string, number>;
  completion_rate: number;
  avg_effort: number;
}

export interface RequirementState {
  requirements: Requirement[];
  currentRequirement: RequirementWithRelations | null;
  groups: RequirementGroup[];
  stats: RequirementStats | null;
  isLoading: boolean;
  error: string | null;
  filters: RequirementFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}     

export interface RequirementSearchParams {
  project_id?: number;
  group_id?: number;
  status?: RequirementStatus[];
  priority?: RequirementPriority[];
  type?: RequirementType[];
  assigned_to?: number[];
  created_by?: number[];
  search?: string;
}

export interface RequirementStatusChange {
  status: RequirementStatus;
  reason?: string;
}

export interface RequirementRelationshipCreate {
  target_requirement_id: number;
  relationship_type: RelationshipType;
}