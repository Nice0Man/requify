// Project types based on backend schemas from project.py

export interface ProjectBase {
  code: string; // 1-50 chars, required
  name: string; // 2-100 chars, required
  description?: string; // optional, max 2000 chars
  status: ProjectStatus; // required, predefined values
}

export interface Project extends ProjectBase {
  id: number;
  owner_id: number;
  created_at: string; // ISO datetime string
}

export interface ProjectWithStats extends Project {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
  // Computed properties
  completion_percentage: number;
  is_completed: boolean;
}

export interface ProjectCreate extends ProjectBase {
  // All fields from ProjectBase are required except description
  // owner_id is set automatically from current user
}

export interface ProjectUpdate {
  code?: string; // 1-50 chars, optional
  name?: string; // 2-100 chars, optional
  description?: string; // optional, max 2000 chars
  status?: ProjectStatus; // optional, predefined values
}

// Backend-defined valid statuses matching project.py validation
export enum ProjectStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  PLANNING = "planning",
  DEVELOPMENT = "development",
  TESTING = "testing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  owner_id?: number | undefined;
}

export interface ProjectListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  owner_id?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ProjectStats {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
}

// Validation constraints matching backend
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
    validValues: Object.values(ProjectStatus),
    validate: (value: string) => {
      if (!value || !value.trim()) {
        return "Project status cannot be empty";
      }
      const validStatuses = Object.values(ProjectStatus);
      if (!validStatuses.includes(value.toLowerCase() as ProjectStatus)) {
        return `Invalid project status. Must be one of: ${validStatuses.join(
          ", "
        )}`;
      }
      return null;
    },
  },
};

// UI state types
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

// Error handling types
export interface ApiError {
  detail:
    | string
    | Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
        input?: any;
      }>;
}

export interface ValidationErrors {
  [field: string]: string;
}

// Helper functions
export const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "success";
    case ProjectStatus.COMPLETED:
      return "primary";
    case ProjectStatus.DEVELOPMENT:
    case ProjectStatus.TESTING:
      return "info";
    case ProjectStatus.PLANNING:
      return "warning";
    case ProjectStatus.INACTIVE:
      return "default";
    case ProjectStatus.ARCHIVED:
    case ProjectStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
};

export const getStatusLabel = (status: ProjectStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const validateProjectForm = (data: ProjectCreate): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate code
  const codeError = ProjectValidation.code.validate(data.code);
  if (codeError) errors.code = codeError;

  // Validate name
  const nameError = ProjectValidation.name.validate(data.name);
  if (nameError) errors.name = nameError;

  // Validate description
  const descriptionError = ProjectValidation.description.validate(
    data.description
  );
  if (descriptionError) errors.description = descriptionError;

  // Validate status
  const statusError = ProjectValidation.status.validate(data.status);
  if (statusError) errors.status = statusError;

  return errors;
};
