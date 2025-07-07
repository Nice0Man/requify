export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  teamMembers: string[];
  tags: string[];
  isActive: boolean;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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

export interface ProjectListResponse {
  projects: ProjectDTO[];
  total: number;
  page: number;
  limit: number;
} 
