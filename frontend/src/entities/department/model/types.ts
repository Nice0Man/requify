/**
 * Department Entity Types - Типы сущности департаментов
 * Соответствуют backend API schemas (backend/app/schemas/department.py)
 */

// =============================================================================
// Enums (соответствуют backend схемам)
// =============================================================================

export const DEPARTMENT_TYPES = [
  "development",
  "marketing",
  "sales", 
  "support",
  "hr",
  "finance",
  "operations",
  "legal",
  "research",
  "design",
  "qa",
  "devops",
  "data",
  "product", 
  "business",
  "administration",
  "customer_success",
  "procurement",
  "security",
  "other",
] as const;

export type DepartmentType = (typeof DEPARTMENT_TYPES)[number];

// =============================================================================
// Основные типы департаментов (соответствуют backend/app/schemas/department.py)
// =============================================================================

export interface DepartmentBase {
  name: string;
  slug?: string;
  description?: string;
  type: DepartmentType;
  parent_id?: number;
  head_id?: number;
  is_active: boolean;
  employee_count: number;
  team_count: number;
  budget_allocated?: number;
  location?: string;
  email?: string;
  phone?: string;
}

export interface DepartmentCreate extends DepartmentBase {
  company_id: number;
}

export interface DepartmentUpdate {
  name?: string;
  slug?: string;
  description?: string;
  type?: DepartmentType;
  parent_id?: number;
  head_id?: number;
  is_active?: boolean;
  employee_count?: number;
  team_count?: number;
  budget_allocated?: number;
  location?: string;
  email?: string;
  phone?: string;
}

export interface Department extends DepartmentBase {
  id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные (опционально загружаются)
  parent?: Department;
  children?: Department[];
  head?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  teams?: {
    id: number;
    name: string;
    member_count: number;
  }[];
}

// =============================================================================
// API Response типы
// =============================================================================

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DepartmentDetailResponse {
  department: Department;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: DepartmentType;
  company_id?: number;
  parent_id?: number;
  is_active?: boolean;
  sort_by?: "name" | "created_at" | "updated_at" | "employee_count" | "team_count";
  sort_order?: "asc" | "desc";
  include_children?: boolean;
  include_head?: boolean;
  include_teams?: boolean;
}

export interface DepartmentBulkOperation {
  department_ids: number[];
  action: "activate" | "deactivate" | "delete" | "move" | "merge";
  target_parent_id?: number; // для move операции
  target_department_id?: number; // для merge операции
}

export interface DepartmentValidationResult {
  is_valid: boolean;
  errors: Record<string, string[]>;
}

export interface DepartmentStatsResponse {
  total_employees: number;
  total_teams: number;
  active_projects: number;
  budget_utilization: number;
  average_team_size: number;
  hierarchy_depth: number;
}

export interface DepartmentHierarchy {
  id: number;
  name: string;
  type: DepartmentType;
  employee_count: number;
  team_count: number;
  children: DepartmentHierarchy[];
  level: number;
}

// =============================================================================
// Department Tree Utils Types
// =============================================================================

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  level: number;
  isExpanded?: boolean;
  isLeaf: boolean;
  path: number[]; // путь от корня
}

export interface DepartmentMoveOperation {
  source_id: number;
  target_parent_id?: number;
  position?: number; // позиция среди siblings
}

export interface DepartmentMergeOperation {
  source_ids: number[];
  target_id: number;
  keep_teams: boolean;
  keep_employees: boolean;
}