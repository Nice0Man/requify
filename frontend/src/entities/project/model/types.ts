import { ReactNode } from "react";

export interface Project {
  [x: string]: ReactNode;
  id: string;
  name: string;
  description: string;
  key: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  teamMembers: string[];
  tags: string[];
  isActive: boolean;
}

export enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  CANCELLED = "cancelled",
}

export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string;
  key: string;
  status: string;
  priority: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  team_members: string[];
  tags: string[];
  is_active: boolean;
}

// API Filters
export interface ProjectFilters {
  search?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  isActive?: boolean;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  period?: string;
}

// API Request/Response types
export interface CreateProjectRequest {
  name: string;
  description: string;
  key: string;
  priority: ProjectPriority;
  startDate: Date;
  endDate?: Date;
  ownerId: string;
  teamMembers?: string[];
  tags?: string[];
}

// Aliases for API compatibility
export type ProjectCreateData = CreateProjectRequest;

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  key?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  ownerId?: string;
  teamMembers?: string[];
  tags?: string[];
  isActive?: boolean;
}

// Aliases for API compatibility
export type ProjectUpdateData = UpdateProjectRequest;

export interface ProjectListResponse {
  projects: ProjectDTO[];
  total: number;
  page: number;
  limit: number;
}

// Stats and Analytics types
export interface ProjectStats {
  id: string;
  name: string;
  totalRequirements: number;
  completedRequirements: number;
  inProgressRequirements: number;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  teamMembersCount: number;
  progressPercentage: number;
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export interface ProjectStatusDistribution {
  status: ProjectStatus;
  count: number;
  percentage: number;
}
