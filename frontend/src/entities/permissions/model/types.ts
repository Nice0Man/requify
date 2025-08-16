/**
 * Permissions Entity Types - Типы сущности разрешений
 * Базовые типы для системы разрешений в соответствии с FSD
 */

import type { UserRole } from "@/entities/user/model/types";

// =============================================================================
// Базовые типы разрешений
// =============================================================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface PermissionRule {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// =============================================================================
// Конфигурация разрешений
// =============================================================================

export interface PermissionConfig {
  // Dashboard
  canViewDashboard: boolean;

  // Projects
  canManageProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewProjects: boolean;

  // Requirements
  canManageRequirements: boolean;
  canCreateRequirements: boolean;
  canEditRequirements: boolean;
  canDeleteRequirements: boolean;
  canViewRequirements: boolean;

  // Releases
  canManageReleases: boolean;
  canCreateReleases: boolean;
  canEditReleases: boolean;
  canDeleteReleases: boolean;
  canViewReleases: boolean;

  // Users & Teams
  canManageUsers: boolean;
  canManageTeams: boolean;
  canViewUsers: boolean;
  canViewTeams: boolean;

  // Testing
  canViewTesting: boolean;
  canManageTesting: boolean;
  canCreateTests: boolean;
  canExecuteTests: boolean;

  // Reports & Analytics
  canViewReports: boolean;
  canCreateReports: boolean;
  canExportReports: boolean;

  // Administration
  canViewAdmin: boolean;
  canManageSystem: boolean;
  canManagePermissions: boolean;

  // Navigation
  sidebarItems: string[];
}

// =============================================================================
// Контекст разрешений
// =============================================================================

export interface PermissionsState {
  permissions: PermissionConfig;
  isLoading: boolean;
  error: string | null;
}

export interface PermissionCheckParams {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// =============================================================================
// Ресурсы и действия (для type-safe проверок)
// =============================================================================

export const PERMISSION_RESOURCES = [
  "dashboard",
  "projects",
  "requirements",
  "releases",
  "users",
  "teams",
  "testing",
  "reports",
  "admin",
  "system",
] as const;

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "manage",
  "execute",
  "export",
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

// =============================================================================
// Экспорт основных типов
// =============================================================================

export type { UserRole } from "@/entities/user/model/types";
