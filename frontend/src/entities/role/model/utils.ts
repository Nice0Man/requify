/**
 * Role Entity Utils - Утилиты для работы с ролями
 */

import type { 
  Role, 
  RoleScope, 
  SystemRole,
  CompanyRole,
  DepartmentRole,
  TeamRole,
  ProjectRole,
  Permission,
  UserRoleAssignment,
} from './types';

// =============================================================================
// Role Scope Utils
// =============================================================================

/**
 * Получение текста области действия роли на русском
 */
export function getRoleScopeText(scope: RoleScope): string {
  const texts: Record<RoleScope, string> = {
    system: 'Система',
    company: 'Компания',
    department: 'Департамент',
    team: 'Команда',
    project: 'Проект',
    resource: 'Ресурс',
  };
  return texts[scope] || scope;
}

/**
 * Получение иконки области действия роли
 */
export function getRoleScopeIcon(scope: RoleScope): string {
  const icons: Record<RoleScope, string> = {
    system: '🔧',
    company: '🏢',
    department: '🏬',
    team: '👥',
    project: '📋',
    resource: '📦',
  };
  return icons[scope] || '📁';
}

/**
 * Получение цвета области действия роли
 */
export function getRoleScopeColor(scope: RoleScope): string {
  const colors: Record<RoleScope, string> = {
    system: 'red',
    company: 'blue',
    department: 'purple',
    team: 'green',
    project: 'orange',
    resource: 'gray',
  };
  return colors[scope] || 'gray';
}

// =============================================================================
// Role Type Utils
// =============================================================================

/**
 * Получение текста роли на русском
 */
export function getRoleText(
  role: SystemRole | CompanyRole | DepartmentRole | TeamRole | ProjectRole
): string {
  const texts: Record<string, string> = {
    // System roles
    system_admin: 'Системный администратор',
    platform_admin: 'Администратор платформы',
    support_admin: 'Администратор поддержки',
    support_agent: 'Агент поддержки',
    billing_admin: 'Администратор биллинга',
    security_auditor: 'Аудитор безопасности',
    compliance_officer: 'Офицер соответствия',
    developer: 'Разработчик',
    data_analyst: 'Аналитик данных',
    
    // Company roles
    company_admin: 'Администратор компании',
    company_owner: 'Владелец компании',
    billing_manager: 'Менеджер биллинга',
    hr_manager: 'HR менеджер',
    compliance_manager: 'Менеджер соответствия',
    security_manager: 'Менеджер безопасности',
    company_viewer: 'Наблюдатель компании',
    
    // Department roles
    department_head: 'Руководитель департамента',
    department_admin: 'Администратор департамента',
    deputy_head: 'Заместитель руководителя',
    senior_manager: 'Старший менеджер',
    manager: 'Менеджер',
    coordinator: 'Координатор',
    department_viewer: 'Наблюдатель департамента',
    
    // Team roles
    team_lead: 'Лидер команды',
    tech_lead: 'Технический лидер',
    senior_member: 'Старший участник',
    member: 'Участник',
    mentor: 'Ментор',
    scrum_master: 'Scrum-мастер',
    product_owner: 'Владелец продукта',
    team_viewer: 'Наблюдатель команды',
    
    // Project roles
    project_manager: 'Менеджер проекта',
    project_owner: 'Владелец проекта',
    architect: 'Архитектор',
    senior_developer: 'Старший разработчик',
    frontend_developer: 'Frontend разработчик',
    backend_developer: 'Backend разработчик',
    mobile_developer: 'Mobile разработчик',
    devops_engineer: 'DevOps инженер',
    qa_engineer: 'QA инженер',
    test_automation_engineer: 'Инженер автотестов',
    business_analyst: 'Бизнес-аналитик',
    product_analyst: 'Продуктовый аналитик',
    ux_designer: 'UX дизайнер',
    ui_designer: 'UI дизайнер',
    technical_writer: 'Технический писатель',
    project_viewer: 'Наблюдатель проекта',
    stakeholder: 'Заинтересованная сторона',
    client: 'Клиент',
  };
  return texts[role] || role;
}

// =============================================================================
// Role Status Utils
// =============================================================================

/**
 * Проверка активности роли
 */
export function isRoleActive(role: Role): boolean {
  return role.is_active;
}

/**
 * Проверка системности роли
 */
export function isSystemRole(role: Role): boolean {
  return role.is_system_role;
}

/**
 * Проверка возможности редактирования роли
 */
export function canEditRole(role: Role): boolean {
  return !role.is_system_role && role.is_active;
}

/**
 * Проверка возможности удаления роли
 */
export function canDeleteRole(role: Role): boolean {
  return !role.is_system_role && (role.users_count === 0 || role.users_count === undefined);
}

// =============================================================================
// Permission Utils
// =============================================================================

/**
 * Группировка разрешений по ресурсам
 */
export function groupPermissionsByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((groups, permission) => {
    const resource = permission.resource;
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);
}

/**
 * Проверка наличия разрешения у роли
 */
export function hasPermission(
  role: Role,
  resource: string,
  action: string
): boolean {
  if (!role.permissions) return false;
  
  return role.permissions.some(
    permission => permission.resource === resource && permission.action === action
  );
}

/**
 * Получение всех действий для ресурса у роли
 */
export function getResourceActions(role: Role, resource: string): string[] {
  if (!role.permissions) return [];
  
  return role.permissions
    .filter(permission => permission.resource === resource)
    .map(permission => permission.action);
}

// =============================================================================
// User Role Assignment Utils
// =============================================================================

/**
 * Проверка активности назначения роли
 */
export function isAssignmentActive(assignment: UserRoleAssignment): boolean {
  if (!assignment.is_active) return false;
  
  if (assignment.expires_at) {
    return new Date(assignment.expires_at) > new Date();
  }
  
  return true;
}

/**
 * Проверка истечения назначения роли
 */
export function isAssignmentExpired(assignment: UserRoleAssignment): boolean {
  if (!assignment.expires_at) return false;
  return new Date(assignment.expires_at) <= new Date();
}

/**
 * Получение оставшихся дней до истечения назначения
 */
export function getDaysUntilExpiration(assignment: UserRoleAssignment): number | null {
  if (!assignment.expires_at) return null;
  
  const expirationDate = new Date(assignment.expires_at);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// =============================================================================
// Role Hierarchy Utils
// =============================================================================

/**
 * Получение иерархии ролей по приоритету
 */
export function getRolesByPriority(roles: Role[]): Role[] {
  return [...roles].sort((a, b) => b.priority - a.priority);
}

/**
 * Проверка возможности назначения роли пользователю
 */
export function canAssignRole(
  targetRole: Role,
  assignerRoles: Role[]
): { canAssign: boolean; reason?: string } {
  if (!targetRole.is_active) {
    return { canAssign: false, reason: 'Роль неактивна' };
  }

  const maxAssignerPriority = Math.max(...assignerRoles.map(r => r.priority), 0);
  
  if (targetRole.priority >= maxAssignerPriority) {
    return { 
      canAssign: false, 
      reason: 'Недостаточно прав для назначения данной роли' 
    };
  }

  return { canAssign: true };
}

// =============================================================================
// Role Data Utils
// =============================================================================

/**
 * Генерация slug из названия роли
 */
export function generateRoleSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

/**
 * Форматирование названия роли для отображения
 */
export function formatRoleName(role: Role): string {
  if (role.scope === 'system') {
    return `${role.name} (Система)`;
  }
  
  const scopeText = getRoleScopeText(role.scope);
  return `${role.name} (${scopeText})`;
}

/**
 * Получение краткого описания роли
 */
export function getRoleDescription(role: Role): string {
  if (role.description) {
    return role.description;
  }
  
  const scopeText = getRoleScopeText(role.scope);
  return `Роль уровня "${scopeText}"`;
}

// =============================================================================
// Sorting and Filtering Utils
// =============================================================================

/**
 * Сортировка ролей
 */
export function sortRoles(
  roles: Role[],
  sortBy: 'name' | 'created_at' | 'updated_at' | 'priority',
  order: 'asc' | 'desc' = 'asc'
): Role[] {
  return [...roles].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created_at':
      case 'updated_at':
        aValue = new Date(a[sortBy]);
        bValue = new Date(b[sortBy]);
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Фильтрация ролей
 */
export function filterRoles(
  roles: Role[],
  filters: {
    search?: string;
    scope?: RoleScope;
    is_system_role?: boolean;
    is_active?: boolean;
    company_id?: number;
    department_id?: number;
    team_id?: number;
    project_id?: number;
  }
): Role[] {
  return roles.filter(role => {
    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        role.name.toLowerCase().includes(searchLower) ||
        role.description?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Фильтр по области действия
    if (filters.scope && role.scope !== filters.scope) {
      return false;
    }

    // Фильтр по типу роли
    if (filters.is_system_role !== undefined && role.is_system_role !== filters.is_system_role) {
      return false;
    }

    // Фильтр по активности
    if (filters.is_active !== undefined && role.is_active !== filters.is_active) {
      return false;
    }

    // Фильтры по привязке к ресурсам
    if (filters.company_id && role.company_id !== filters.company_id) {
      return false;
    }

    if (filters.department_id && role.department_id !== filters.department_id) {
      return false;
    }

    if (filters.team_id && role.team_id !== filters.team_id) {
      return false;
    }

    if (filters.project_id && role.project_id !== filters.project_id) {
      return false;
    }

    return true;
  });
}