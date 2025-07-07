export interface Requirement {
  id: string;
  title: string;
  description: string;
  projectId: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  assigneeId?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isActive: boolean;
}

export enum RequirementType {
  FUNCTIONAL = "functional",
  NON_FUNCTIONAL = "non_functional",
  BUSINESS = "business",
  USER_STORY = "user_story",
  EPIC = "epic",
}

export enum RequirementPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum RequirementStatus {
  DRAFT = "draft",
  REVIEW = "review",
  APPROVED = "approved",
  IN_DEVELOPMENT = "in_development",
  TESTING = "testing",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export interface RequirementDTO {
  id: string;
  title: string;
  description: string;
  project_id: string;
  type: string;
  priority: string;
  status: string;
  assignee_id?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_active: boolean;
}

export interface CreateRequirementRequest {
  title: string;
  description: string;
  projectId: string;
  type: RequirementType;
  priority: RequirementPriority;
  assigneeId?: string;
  tags?: string[];
}

export interface UpdateRequirementRequest {
  title?: string;
  description?: string;
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  assigneeId?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface RequirementListResponse {
  requirements: RequirementDTO[];
  total: number;
  page: number;
  limit: number;
}
