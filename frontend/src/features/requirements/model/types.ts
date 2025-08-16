export interface RequirementManagementState {
  requirements: any[];
  selectedRequirement: any | null;
  isPending: boolean;
  error: string | null;
}

export interface RequirementFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: string;
}

export interface RequirementFilters {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId?: string;
  authorId?: string;
  isActive?: boolean;
}

export interface RequirementStats {
  totalCount: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

export interface CreateRequirementData {
  title: string;
  description?: string;
  type: string;
  priority: string;
  projectId?: string;
  tags?: string[];
}

export interface UpdateRequirementData {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  progress?: number;
}

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  authorId: string;
  projectId?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}
