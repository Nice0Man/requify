/**
 * Team Types - основано на схемах из backend/app/schemas/team.py
 */

// === Base Team Types ===

export interface TeamBase {
  name: string;
  description?: string;
}

export interface TeamCreate extends TeamBase {}

export interface TeamUpdate {
  name?: string;
  description?: string;
}

export interface TeamInDBBase extends TeamBase {
  id: number;
  creator_id: number;
  created_at: string;
  updated_at: string;
  archived: boolean;
  archived_at?: string;
}

export interface Team extends TeamInDBBase {
  member_count: number;
}

// === Team Member Types ===

export interface TeamMemberBase {
  user_id: number;
  role: TeamMemberRole;
}

export interface TeamMemberCreate extends TeamMemberBase {}

export interface TeamMemberUpdate {
  role: TeamMemberRole;
}

export interface TeamMemberInDBBase extends TeamMemberBase {
  team_id: number;
  joined_at: string;
  updated_at: string;
}

export interface TeamMember extends TeamMemberInDBBase {
  user?: {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// === Team Statistics ===

export interface TeamStats {
  total_members: number;
  active_members: number;
  projects_count: number;
  completed_projects: number;
  total_requirements: number;
  completed_requirements: number;
}

// === Query Parameters ===

export interface TeamQueryParams {
  archived?: boolean;
  created_after?: string;
  created_before?: string;
  search?: string;
  member_id?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// === Bulk Operations ===

export interface BulkCreateTeamsRequest {
  teams: TeamCreate[];
}

export interface BulkAddMembersRequest {
  members: TeamMemberCreate[];
}

// === Permission Management ===

export interface PermissionCheckRequest {
  user_id: number;
  team_id: number;
  permission: string;
}

export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string;
}

// === Response Types ===

export interface TeamListResponse {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface TeamDetailResponse {
  data: Team;
}

export interface TeamMemberListResponse {
  data: TeamMember[];
  total: number;
}

export interface TeamStatsResponse {
  data: TeamStats;
}

export interface TeamStatsOverviewResponse {
  data: {
    total_teams: number;
    active_teams: number;
    archived_teams: number;
    total_members: number;
    average_team_size: number;
  };
}

// === Validation Types ===

export interface TeamValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

// === Export/Import Types ===

export interface TeamExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  include_members?: boolean;
  include_stats?: boolean;
  date_range?: {
    from: string;
    to: string;
  };
}

export interface TeamImportData {
  teams: TeamCreate[];
  validate_only?: boolean;
} 