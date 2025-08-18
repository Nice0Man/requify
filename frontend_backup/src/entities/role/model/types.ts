/**
 * Role Entity Types - Типы сущности ролей
 * Соответствуют backend API schemas (backend/app/schemas/enhanced_role.py)
 */

// =============================================================================
// Enums (соответствуют backend схемам)
// =============================================================================

export const ROLE_SCOPES = [
  "system",
  "company", 
  "department",
  "team",
  "project",
  "resource",
] as const;

export type RoleScope = (typeof ROLE_SCOPES)[number];

export const SYSTEM_ROLES = [
  "system_admin",
  "platform_admin",
  "support_admin",
  "support_agent",
  "billing_admin",
  "security_auditor",
  "compliance_officer",
  "developer",
  "data_analyst",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const COMPANY_ROLES = [
  "company_admin",
  "company_owner",
  "billing_manager",
  "hr_manager",
  "compliance_manager",
  "security_manager",
  "company_viewer",
] as const;

export type CompanyRole = (typeof COMPANY_ROLES)[number];

export const DEPARTMENT_ROLES = [
  "department_head",
  "department_admin",
  "deputy_head",
  "senior_manager",
  "manager",
  "coordinator",
  "department_viewer",
] as const;

export type DepartmentRole = (typeof DEPARTMENT_ROLES)[number];

export const TEAM_ROLES = [
  "team_lead",
  "tech_lead",
  "senior_member",
  "member",
  "mentor",
  "scrum_master",
  "product_owner",
  "team_viewer",
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const PROJECT_ROLES = [
  "project_manager",
  "project_owner",
  "architect",
  "senior_developer",
  "developer",
  "frontend_developer",
  "backend_developer",
  "mobile_developer",
  "devops_engineer",
  "qa_engineer",
  "test_automation_engineer",
  "business_analyst",
  "product_analyst",
  "data_analyst",
  "ux_designer",
  "ui_designer",
  "technical_writer",
  "project_viewer",
  "stakeholder",
  "client",
] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

// =============================================================================
// Permission Types
// =============================================================================

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PermissionCreate {
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface PermissionUpdate {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  conditions?: Record<string, any>;
}

// =============================================================================
// Role Types
// =============================================================================

export interface RoleBase {
  name: string;
  slug?: string;
  description?: string;
  scope: RoleScope;
  is_system_role: boolean;
  is_active: boolean;
  priority: number;
  metadata?: Record<string, any>;
}

export interface RoleCreate extends RoleBase {
  company_id?: number;
  department_id?: number;
  team_id?: number;
  project_id?: number;
  permission_ids?: number[];
}

export interface RoleUpdate {
  name?: string;
  slug?: string;
  description?: string;
  scope?: RoleScope;
  is_active?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
  permission_ids?: number[];
}

export interface Role extends RoleBase {
  id: number;
  company_id?: number;
  department_id?: number;
  team_id?: number;
  project_id?: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные (опционально загружаются)
  permissions?: Permission[];
  users_count?: number;
  company?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
  };
  project?: {
    id: number;
    name: string;
  };
}

// =============================================================================
// User Role Assignment Types
// =============================================================================

export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  scope: RoleScope;
  resource_id?: number;
  is_active: boolean;
  granted_by?: number;
  granted_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  role?: Role;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
  };
  granted_by_user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface UserRoleAssignmentCreate {
  user_id: number;
  role_id: number;
  scope: RoleScope;
  resource_id?: number;
  expires_at?: string;
}

export interface UserRoleAssignmentUpdate {
  is_active?: boolean;
  expires_at?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface RoleListResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RoleDetailResponse {
  role: Role;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserRoleAssignmentListResponse {
  assignments: UserRoleAssignment[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  scope?: RoleScope;
  company_id?: number;
  department_id?: number;
  team_id?: number;
  project_id?: number;
  is_system_role?: boolean;
  is_active?: boolean;
  sort_by?: "name" | "created_at" | "updated_at" | "priority";
  sort_order?: "asc" | "desc";
  include_permissions?: boolean;
  include_users_count?: boolean;
}

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  action?: string;
  sort_by?: "name" | "resource" | "action" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface UserRoleQueryParams {
  page?: number;
  limit?: number;
  user_id?: number;
  role_id?: number;
  scope?: RoleScope;
  resource_id?: number;
  is_active?: boolean;
  expires_before?: string;
  expires_after?: string;
  sort_by?: "granted_at" | "expires_at" | "created_at";
  sort_order?: "asc" | "desc";
  include_role?: boolean;
  include_user?: boolean;
}

// =============================================================================
// Bulk Operations
// =============================================================================

export interface RoleBulkOperation {
  role_ids: number[];
  action: "activate" | "deactivate" | "delete" | "assign_permissions" | "remove_permissions";
  permission_ids?: number[];
}

export interface UserRoleBulkOperation {
  assignment_ids: number[];
  action: "activate" | "deactivate" | "delete" | "extend" | "revoke";
  expires_at?: string;
}

// =============================================================================
// Validation and Stats
// =============================================================================

export interface RoleValidationResult {
  is_valid: boolean;
  errors: Record<string, string[]>;
}

export interface RoleStatsResponse {
  total_roles: number;
  system_roles: number;
  company_roles: number;
  department_roles: number;
  team_roles: number;
  project_roles: number;
  active_roles: number;
  inactive_roles: number;
  total_assignments: number;
  active_assignments: number;
  expired_assignments: number;
}