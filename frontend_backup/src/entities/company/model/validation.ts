/**
 * Company Entity Validation - Валидация данных компаний
 * Соответствует правилам валидации из backend schemas
 */

import type { CompanyCreate, CompanyUpdate, CompanyType, CompanyStatus } from './types';

// =============================================================================
// Validation Rules
// =============================================================================

export const VALIDATION_RULES = {
  name: {
    minLength: 3,
    maxLength: 200,
    required: true,
  },
  slug: {
    pattern: /^[a-z0-9-]+$/,
    maxLength: 100,
    required: false,
  },
  legal_name: {
    maxLength: 300,
    required: false,
  },
  description: {
    maxLength: 1000,
    required: false,
  },
  industry: {
    maxLength: 100,
    required: false,
  },
  size_category: {
    maxLength: 50,
    required: false,
  },
  employee_count: {
    min: 0,
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
 * Валидация имени компании
 */
export function validateCompanyName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmedName = name?.trim();

  if (!trimmedName) {
    errors.push({
      field: 'name',
      message: 'Название компании обязательно для заполнения',
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
 * Валидация slug компании
 */
export function validateCompanySlug(slug?: string): ValidationError[] {
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
 * Валидация email адреса
 */
export function validateEmail(email?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailPattern.test(email)) {
    errors.push({
      field: 'email',
      message: 'Некорректный формат email адреса',
    });
  }

  return errors;
}

/**
 * Валидация телефонного номера
 */
export function validatePhone(phone?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;

  if (phone && !phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'Некорректный формат телефонного номера',
    });
  }

  return errors;
}

/**
 * Полная валидация данных создания компании
 */
export function validateCompanyCreate(data: CompanyCreate): ValidationResult {
  const errors: ValidationError[] = [
    ...validateCompanyName(data.name),
    ...validateCompanySlug(data.slug),
    ...validateEmployeeCount(data.employee_count),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Полная валидация данных обновления компании
 */
export function validateCompanyUpdate(data: CompanyUpdate): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.name !== undefined) {
    errors.push(...validateCompanyName(data.name));
  }

  if (data.slug !== undefined) {
    errors.push(...validateCompanySlug(data.slug));
  }

  if (data.employee_count !== undefined) {
    errors.push(...validateEmployeeCount(data.employee_count));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Проверка корректности URL
 */
export function validateUrl(url?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (url) {
    try {
      new URL(url);
    } catch {
      errors.push({
        field: 'url',
        message: 'Некорректный формат URL',
      });
    }
  }

  return errors;
}

/**
 * Проверка корректности цвета (hex формат)
 */
export function validateColor(color?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (color && !colorPattern.test(color)) {
    errors.push({
      field: 'color',
      message: 'Цвет должен быть в формате HEX (#RRGGBB или #RGB)',
    });
  }

  return errors;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Очистка и нормализация данных компании
 */
export function sanitizeCompanyData<T extends Partial<CompanyCreate | CompanyUpdate>>(data: T): T {
  const sanitized = { ...data };

  // Обрезаем пробелы в строковых полях
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }

  if (sanitized.legal_name) {
    sanitized.legal_name = sanitized.legal_name.trim();
  }

  if (sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }

  if (sanitized.industry) {
    sanitized.industry = sanitized.industry.trim();
  }

  if (sanitized.size_category) {
    sanitized.size_category = sanitized.size_category.trim();
  }

  // Нормализуем slug
  if (sanitized.slug) {
    sanitized.slug = sanitized.slug.toLowerCase().trim();
  }

  return sanitized;
}