/**
 * Department Entity Validation - Валидация данных департаментов
 * Соответствует правилам валидации из backend schemas
 */

import type { DepartmentCreate, DepartmentUpdate, DepartmentType } from './types';

// =============================================================================
// Validation Rules
// =============================================================================

export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 200,
    required: true,
  },
  slug: {
    pattern: /^[a-z0-9-]+$/,
    maxLength: 100,
    required: false,
  },
  description: {
    maxLength: 1000,
    required: false,
  },
  employee_count: {
    min: 0,
    required: false,
  },
  team_count: {
    min: 0,
    required: false,
  },
  budget_allocated: {
    min: 0,
    required: false,
  },
  location: {
    maxLength: 200,
    required: false,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
    required: false,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    required: false,
  },
} as const;

// =============================================================================
// Validation Functions
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Валидация названия департамента
 */
export function validateDepartmentName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmedName = name?.trim();

  if (!trimmedName) {
    errors.push({
      field: 'name',
      message: 'Название департамента обязательно для заполнения',
    });
    return errors;
  }

  if (trimmedName.length < VALIDATION_RULES.name.minLength) {
    errors.push({
      field: 'name',
      message: `Название должно содержать минимум ${VALIDATION_RULES.name.minLength} символа`,
    });
  }

  if (trimmedName.length > VALIDATION_RULES.name.maxLength) {
    errors.push({
      field: 'name',
      message: `Название не должно превышать ${VALIDATION_RULES.name.maxLength} символов`,
    });
  }

  return errors;
}

/**
 * Валидация slug департамента
 */
export function validateDepartmentSlug(slug?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (slug && !VALIDATION_RULES.slug.pattern.test(slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug должен содержать только строчные буквы, цифры и дефисы',
    });
  }

  if (slug && slug.length > VALIDATION_RULES.slug.maxLength) {
    errors.push({
      field: 'slug',
      message: `Slug не должен превышать ${VALIDATION_RULES.slug.maxLength} символов`,
    });
  }

  return errors;
}

/**
 * Валидация количества сотрудников
 */
export function validateEmployeeCount(count?: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (count !== undefined && count < VALIDATION_RULES.employee_count.min) {
    errors.push({
      field: 'employee_count',
      message: 'Количество сотрудников не может быть отрицательным',
    });
  }

  return errors;
}

/**
 * Валидация количества команд
 */
export function validateTeamCount(count?: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (count !== undefined && count < VALIDATION_RULES.team_count.min) {
    errors.push({
      field: 'team_count',
      message: 'Количество команд не может быть отрицательным',
    });
  }

  return errors;
}

/**
 * Валидация бюджета
 */
export function validateBudget(budget?: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (budget !== undefined && budget < VALIDATION_RULES.budget_allocated.min) {
    errors.push({
      field: 'budget_allocated',
      message: 'Бюджет не может быть отрицательным',
    });
  }

  return errors;
}

/**
 * Валидация email адреса
 */
export function validateEmail(email?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (email && !VALIDATION_RULES.email.pattern.test(email)) {
    errors.push({
      field: 'email',
      message: 'Некорректный формат email адреса',
    });
  }

  if (email && email.length > VALIDATION_RULES.email.maxLength) {
    errors.push({
      field: 'email',
      message: `Email не должен превышать ${VALIDATION_RULES.email.maxLength} символов`,
    });
  }

  return errors;
}

/**
 * Валидация телефонного номера
 */
export function validatePhone(phone?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (phone && !VALIDATION_RULES.phone.pattern.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'Некорректный формат телефонного номера',
    });
  }

  return errors;
}

/**
 * Валидация локации
 */
export function validateLocation(location?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (location && location.length > VALIDATION_RULES.location.maxLength) {
    errors.push({
      field: 'location',
      message: `Локация не должна превышать ${VALIDATION_RULES.location.maxLength} символов`,
    });
  }

  return errors;
}

/**
 * Валидация иерархии (проверка циклических зависимостей)
 */
export function validateDepartmentHierarchy(
  departmentId: number,
  parentId?: number,
  allDepartments?: { id: number; parent_id?: number }[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!parentId || !allDepartments) {
    return errors;
  }

  // Проверка на самоссылку
  if (departmentId === parentId) {
    errors.push({
      field: 'parent_id',
      message: 'Департамент не может быть родителем самого себя',
    });
    return errors;
  }

  // Проверка на циклические зависимости
  const visited = new Set<number>();
  let currentId = parentId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    
    if (currentId === departmentId) {
      errors.push({
        field: 'parent_id',
        message: 'Обнаружена циклическая зависимость в иерархии департаментов',
      });
      break;
    }

    const parent = allDepartments.find(d => d.id === currentId);
    currentId = parent?.parent_id;
  }

  return errors;
}

/**
 * Полная валидация данных создания департамента
 */
export function validateDepartmentCreate(
  data: DepartmentCreate,
  allDepartments?: { id: number; parent_id?: number }[]
): ValidationResult {
  const errors: ValidationError[] = [
    ...validateDepartmentName(data.name),
    ...validateDepartmentSlug(data.slug),
    ...validateEmployeeCount(data.employee_count),
    ...validateTeamCount(data.team_count),
    ...validateBudget(data.budget_allocated),
    ...validateEmail(data.email),
    ...validatePhone(data.phone),
    ...validateLocation(data.location),
  ];

  // Валидация иерархии для новых департаментов
  if (data.parent_id && allDepartments) {
    // Для нового департамента используем временный ID
    const tempId = -1;
    errors.push(...validateDepartmentHierarchy(tempId, data.parent_id, allDepartments));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Полная валидация данных обновления департамента
 */
export function validateDepartmentUpdate(
  departmentId: number,
  data: DepartmentUpdate,
  allDepartments?: { id: number; parent_id?: number }[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.name !== undefined) {
    errors.push(...validateDepartmentName(data.name));
  }

  if (data.slug !== undefined) {
    errors.push(...validateDepartmentSlug(data.slug));
  }

  if (data.employee_count !== undefined) {
    errors.push(...validateEmployeeCount(data.employee_count));
  }

  if (data.team_count !== undefined) {
    errors.push(...validateTeamCount(data.team_count));
  }

  if (data.budget_allocated !== undefined) {
    errors.push(...validateBudget(data.budget_allocated));
  }

  if (data.email !== undefined) {
    errors.push(...validateEmail(data.email));
  }

  if (data.phone !== undefined) {
    errors.push(...validatePhone(data.phone));
  }

  if (data.location !== undefined) {
    errors.push(...validateLocation(data.location));
  }

  // Валидация иерархии при изменении родителя
  if (data.parent_id !== undefined && allDepartments) {
    errors.push(...validateDepartmentHierarchy(departmentId, data.parent_id, allDepartments));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Очистка и нормализация данных департамента
 */
export function sanitizeDepartmentData<T extends Partial<DepartmentCreate | DepartmentUpdate>>(data: T): T {
  const sanitized = { ...data };

  // Обрезаем пробелы в строковых полях
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }

  if (sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }

  if (sanitized.location) {
    sanitized.location = sanitized.location.trim();
  }

  if (sanitized.email) {
    sanitized.email = sanitized.email.trim().toLowerCase();
  }

  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.trim();
  }

  // Нормализуем slug
  if (sanitized.slug) {
    sanitized.slug = sanitized.slug.toLowerCase().trim();
  }

  return sanitized;
}