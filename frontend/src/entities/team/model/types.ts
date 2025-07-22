import { Team, TeamMember, TeamStats } from "../api";

// Re-export API types for use in components
export type {
  Team,
  TeamMember,
  TeamMemberRole,
  TeamStats,
  TeamListResponse,
  TeamStatsOverviewResponse,
  TeamCreate as CreateTeamRequest,
  TeamUpdate as UpdateTeamRequest,
  TeamMemberCreate as AddTeamMemberRequest,
  TeamMemberUpdate as UpdateTeamMemberRequest,
  BulkCreateTeamsRequest,
  BulkAddMembersRequest,
  PermissionCheckRequest,
  PermissionCheckResponse,
  TeamQueryParams as TeamFilters,
} from "../api/types";

// Internal model types for UI state management
export interface TeamState {
  selectedTeam: Team | null;
  teams: Team[];
  members: TeamMember[];
  stats: TeamStats | null;
  loading: boolean;
  error: string | null;
}

export interface TeamFormData {
  name: string;
  description: string;
}

export interface TeamMemberFormData {
  user_id: string;
  role: string;
}

export interface TeamSearchFilters {
  search: string;
  archived: boolean;
  member_id?: string;
}

// UI-specific enums
export enum TeamViewMode {
  LIST = "list",
  CARDS = "cards",
  TABLE = "table",
}

export enum TeamMemberPermission {
  VIEW = "view",
  EDIT = "edit",
  MANAGE_MEMBERS = "manage_members",
  DELETE = "delete",
  ARCHIVE = "archive",
}
