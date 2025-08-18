/**
 * Department Entity Utils - Утилиты для работы с департаментами
 */

import type { 
  Department, 
  DepartmentType, 
  DepartmentTreeNode,
  DepartmentHierarchy,
} from './types';

// =============================================================================
// Department Type Utils
// =============================================================================

/**
 * Получение текста типа департамента на русском
 */
export function getDepartmentTypeText(type: DepartmentType): string {
  const texts: Record<DepartmentType, string> = {
    development: 'Разработка',
    marketing: 'Маркетинг',
    sales: 'Продажи',
    support: 'Поддержка',
    hr: 'HR',
    finance: 'Финансы',
    operations: 'Операции',
    legal: 'Юридический',
    research: 'Исследования',
    design: 'Дизайн',
    qa: 'Тестирование',
    devops: 'DevOps',
    data: 'Данные',
    product: 'Продукт',
    business: 'Бизнес',
    administration: 'Администрация',
    customer_success: 'Клиентский успех',
    procurement: 'Закупки',
    security: 'Безопасность',
    other: 'Другое',
  };
  return texts[type] || type;
}

/**
 * Alias для getDepartmentTypeText для обратной совместимости
 */
export const getDepartmentTypeLabel = getDepartmentTypeText;

/**
 * Получение иконки типа департамента
 */
export function getDepartmentTypeIcon(type: DepartmentType): string {
  const icons: Record<DepartmentType, string> = {
    development: 'Computer',
    marketing: 'Campaign',
    sales: 'AttachMoney',
    support: 'Headset',
    hr: 'Groups',
    finance: 'CreditCard',
    operations: 'Settings',
    legal: 'Gavel',
    research: 'Science',
    design: 'Palette',
    qa: 'BugReport',
    devops: 'Rocket',
    data: 'Analytics',
    product: 'Inventory',
    business: 'TrendingUp',
    administration: 'Business',
    customer_success: 'Handshake',
    procurement: 'ShoppingCart',
    security: 'Security',
    other: 'Folder',
  };
  return icons[type] || 'Folder';
}

/**
 * Получение цвета типа департамента для UI
 */
export function getDepartmentTypeColor(type: DepartmentType): string {
  const colors: Record<DepartmentType, string> = {
    development: 'blue',
    marketing: 'purple',
    sales: 'green',
    support: 'orange',
    hr: 'pink',
    finance: 'emerald',
    operations: 'gray',
    legal: 'indigo',
    research: 'cyan',
    design: 'violet',
    qa: 'amber',
    devops: 'red',
    data: 'teal',
    product: 'blue',
    business: 'slate',
    administration: 'neutral',
    customer_success: 'lime',
    procurement: 'yellow',
    security: 'rose',
    other: 'gray',
  };
  return colors[type] || 'gray';
}

// =============================================================================
// Department Status Utils
// =============================================================================

/**
 * Проверка активности департамента
 */
export function isDepartmentActive(department: Department): boolean {
  return department.is_active;
}

/**
 * Проверка возможности редактирования департамента
 */
export function canEditDepartment(department: Department): boolean {
  return department.is_active;
}

/**
 * Проверка возможности удаления департамента
 */
export function canDeleteDepartment(department: Department): boolean {
  return department.employee_count === 0 && department.team_count === 0;
}

// =============================================================================
// Department Hierarchy Utils
// =============================================================================

/**
 * Построение дерева департаментов из плоского списка
 */
export function buildDepartmentTree(departments: Department[]): DepartmentTreeNode[] {
  const departmentMap = new Map<number, DepartmentTreeNode>();
  const rootDepartments: DepartmentTreeNode[] = [];

  // Создаем мапу всех департаментов
  departments.forEach(dept => {
    departmentMap.set(dept.id, {
      ...dept,
      children: [],
      level: 0,
      isLeaf: true,
      path: [],
    });
  });

  // Строим иерархию
  departments.forEach(dept => {
    const node = departmentMap.get(dept.id)!;
    
    if (dept.parent_id && departmentMap.has(dept.parent_id)) {
      const parent = departmentMap.get(dept.parent_id)!;
      parent.children.push(node);
      parent.isLeaf = false;
      node.level = parent.level + 1;
      node.path = [...parent.path, parent.id];
    } else {
      rootDepartments.push(node);
    }
  });

  // Сортируем по имени на каждом уровне
  const sortChildren = (nodes: DepartmentTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => sortChildren(node.children));
  };

  sortChildren(rootDepartments);

  return rootDepartments;
}

/**
 * Получение пути департамента в иерархии
 */
export function getDepartmentPath(
  department: Department,
  departments: Department[]
): Department[] {
  const path: Department[] = [department];
  let current = department;

  while (current.parent_id) {
    const parent = departments.find(d => d.id === current.parent_id);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }

  return path;
}

/**
 * Получение всех потомков департамента
 */
export function getDepartmentDescendants(
  departmentId: number,
  departments: Department[]
): Department[] {
  const descendants: Department[] = [];
  const directChildren = departments.filter(d => d.parent_id === departmentId);

  directChildren.forEach(child => {
    descendants.push(child);
    descendants.push(...getDepartmentDescendants(child.id, departments));
  });

  return descendants;
}

/**
 * Проверка является ли департамент предком другого
 */
export function isAncestor(
  ancestorId: number,
  descendantId: number,
  departments: Department[]
): boolean {
  const descendant = departments.find(d => d.id === descendantId);
  if (!descendant) return false;

  let current = descendant;
  while (current.parent_id) {
    if (current.parent_id === ancestorId) return true;
    const parent = departments.find(d => d.id === current.parent_id);
    if (!parent) break;
    current = parent;
  }

  return false;
}

/**
 * Получение глубины департамента в иерархии
 */
export function getDepartmentDepth(
  department: Department,
  departments: Department[]
): number {
  let depth = 0;
  let current = department;

  while (current.parent_id) {
    const parent = departments.find(d => d.id === current.parent_id);
    if (!parent) break;
    depth++;
    current = parent;
  }

  return depth;
}

/**
 * Валидация возможности перемещения департамента
 */
export function canMoveDepartment(
  sourceId: number,
  targetParentId: number | undefined,
  departments: Department[]
): { canMove: boolean; reason?: string } {
  if (sourceId === targetParentId) {
    return { canMove: false, reason: 'Департамент не может быть родителем самого себя' };
  }

  if (targetParentId && isAncestor(sourceId, targetParentId, departments)) {
    return { canMove: false, reason: 'Департамент не может быть перемещен в своего потомка' };
  }

  return { canMove: true };
}

// =============================================================================
// Department Data Utils
// =============================================================================

/**
 * Генерация slug из названия департамента
 */
export function generateDepartmentSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/g, '') // Удаляем специальные символы
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/-+/g, '-') // Удаляем повторяющиеся дефисы
    .trim()
    .replace(/^-|-$/g, ''); // Удаляем дефисы в начале и конце
}

/**
 * Форматирование бюджета департамента
 */
export function formatDepartmentBudget(budget?: number, currency = 'RUB'): string {
  if (!budget) return 'Не указан';
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(budget);
}

/**
 * Получение инициалов названия департамента
 */
export function getDepartmentInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Расчет эффективности департамента
 */
export function calculateDepartmentEfficiency(department: Department): {
  employeeEfficiency: number;
  budgetEfficiency: number;
  overallEfficiency: number;
} {
  const employeeEfficiency = department.team_count > 0 
    ? department.employee_count / department.team_count 
    : 0;

  const budgetEfficiency = department.budget_allocated && department.employee_count > 0
    ? department.budget_allocated / department.employee_count
    : 0;

  const overallEfficiency = (employeeEfficiency + (budgetEfficiency > 0 ? 1 : 0)) / 2;

  return {
    employeeEfficiency: Math.round(employeeEfficiency * 100) / 100,
    budgetEfficiency: Math.round(budgetEfficiency * 100) / 100,
    overallEfficiency: Math.round(overallEfficiency * 100) / 100,
  };
}

// =============================================================================
// Sorting and Filtering Utils
// =============================================================================

/**
 * Сортировка департаментов
 */
export function sortDepartments(
  departments: Department[],
  sortBy: 'name' | 'created_at' | 'updated_at' | 'employee_count' | 'team_count',
  order: 'asc' | 'desc' = 'asc'
): Department[] {
  return [...departments].sort((a, b) => {
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
      case 'employee_count':
      case 'team_count':
        aValue = a[sortBy];
        bValue = b[sortBy];
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
 * Фильтрация департаментов
 */
export function filterDepartments(
  departments: Department[],
  filters: {
    search?: string;
    type?: DepartmentType;
    company_id?: number;
    parent_id?: number;
    is_active?: boolean;
  }
): Department[] {
  return departments.filter(department => {
    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        department.name.toLowerCase().includes(searchLower) ||
        department.description?.toLowerCase().includes(searchLower) ||
        department.location?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Фильтр по типу
    if (filters.type && department.type !== filters.type) {
      return false;
    }

    // Фильтр по компании
    if (filters.company_id && department.company_id !== filters.company_id) {
      return false;
    }

    // Фильтр по родителю
    if (filters.parent_id !== undefined && department.parent_id !== filters.parent_id) {
      return false;
    }

    // Фильтр по активности
    if (filters.is_active !== undefined && department.is_active !== filters.is_active) {
      return false;
    }

    return true;
  });
}