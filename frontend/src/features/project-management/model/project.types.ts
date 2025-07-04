// Project management feature типы - импортируем базовые типы из entities
// Этот файл содержит только типы, специфичные для project management фичи

import { Project, ProjectCreate, ProjectStatus, ProjectWithStats } from './projects.types';

// Импорты из entities слоя (бизнес-сущности)
export type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectStatus,
} from '@/entities/project/model/types';

// Импорты из shared слоя (API типы)
export type {
  PaginatedResponse,
  ListParams,
  ApiError,
} from '@/shared/types/api';

// =============================================================================
// Feature-Specific Types (UI, формы, валидация)
// =============================================================================

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  owner_id?: number | undefined;
}

export interface ProjectFormData extends ProjectCreate {
  // Additional UI-only fields can be added here if needed
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectWithStats | null;
  isLoading: boolean;
  error: string | null;
  filters: ProjectFilters;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface ValidationErrors {
  [field: string]: string;
}

// Валидация проектов (специфична для UI)
export const ProjectValidation = {
  code: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[A-Z0-9\-_]+$/, // Only letters, numbers, hyphens, underscores
    transform: (value: string) => value.trim().toUpperCase(),
    validate: (value: string) => {
      if (!value || !value.trim()) {
        return "Project code cannot be empty";
      }
      const trimmed = value.trim().toUpperCase();
      if (!trimmed.match(/^[A-Z0-9\-_]+$/)) {
        return "Project code can only contain letters, numbers, hyphens and underscores";
      }
      if (
        trimmed.startsWith("-") ||
        trimmed.startsWith("_") ||
        trimmed.endsWith("-") ||
        trimmed.endsWith("_")
      ) {
        return "Project code cannot start or end with hyphen or underscore";
      }
      return null;
    },
  },
  name: {
    minLength: 2,
    maxLength: 100,
    forbiddenChars: ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"],
    validate: (value: string) => {
      if (!value || !value.trim()) {
        return "Project name cannot be empty";
      }
      const trimmed = value.trim();
      const forbiddenChars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"];
      if (forbiddenChars.some((char) => trimmed.includes(char))) {
        return `Project name contains forbidden characters: ${forbiddenChars.join(
          ", "
        )}`;
      }
      return null;
    },
  },
  description: {
    maxLength: 2000,
    validate: (value?: string) => {
      if (value && value.trim().length > 2000) {
        return "Description cannot exceed 2000 characters";
      }
      return null;
    },
  },
  status: {
    validValues: ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'],
    validate: (value: string) => {
      if (!value || !value.trim()) {
        return "Project status cannot be empty";
      }
      const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'];
      if (!validStatuses.includes(value.toLowerCase())) {
        return `Invalid project status. Must be one of: ${validStatuses.join(
          ", "
        )}`;
      }
      return null;
    },
  },
};

// Maps для статусов (используем Maps для лучшей производительности и типизации)
export const statusColorMap = new Map<ProjectStatus, string>([
  ['active', 'success'],
  ['completed', 'primary'],
  ['planning', 'warning'],
  ['on_hold', 'secondary'],
  ['cancelled', 'error'],
  ['archived', 'default'],
]);

export const statusLabelMap = new Map<ProjectStatus, string>([
  ['planning', 'Планирование'],
  ['active', 'Активный'],
  ['on_hold', 'Приостановлен'],
  ['completed', 'Завершен'],
  ['cancelled', 'Отменен'],
  ['archived', 'Архивирован'],
]);

// Helper functions для UI
export const getStatusColor = (status: ProjectStatus): string => {
  return statusColorMap.get(status) || 'default';
};

export const getStatusLabel = (status: ProjectStatus): string => {
  return statusLabelMap.get(status) || status;
};

export const validateProjectForm = (data: ProjectCreate): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  const codeError = ProjectValidation.code.validate(data.code);
  if (codeError) errors.code = codeError;
  
  const nameError = ProjectValidation.name.validate(data.name);
  if (nameError) errors.name = nameError;
  
  const descError = ProjectValidation.description.validate(data.description);
  if (descError) errors.description = descError;
  
  const statusError = ProjectValidation.status.validate(data.status);
  if (statusError) errors.status = statusError;
  
  return errors;
};
