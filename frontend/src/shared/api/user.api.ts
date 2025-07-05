// User types and interfaces - точно соответствуют backend/app/schemas/user.py

// =============================================================================
// User Role and Status Types (точно как в бэкенде)
// =============================================================================

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager", 
  ANALYST: "analyst",
  DEVELOPER: "developer",
  TESTER: "tester",
  VIEWER: "viewer",
  GUEST: "guest",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive", 
  SUSPENDED: "suspended",
  PENDING: "pending",
  DELETED: "deleted",
} as const;

// Type for user role values
export type UserRoleValue = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatusValue = typeof USER_STATUSES[keyof typeof USER_STATUSES];

// Legacy support - export as object too
export const UserRole = USER_ROLES;

// =============================================================================
// Core User Types (точно соответствуют backend/app/schemas/user.py)
// =============================================================================

export interface UserBase {
  username: string;
  email: string;
  role: UserRoleValue;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
}

export interface User extends UserBase {
  id: number; // Исправлено: было string, должно быть number
  created_at: string;
  email_verified: boolean; // Добавлено: обязательное поле из бэкенда
  email_verified_at?: string; // Добавлено: из бэкенда
  is_active?: boolean; // Опциональное для совместимости с UI
  last_login?: string;
  avatar_url?: string; // UI расширение
}

export interface UserCreate {
  username: string;
  email: string; 
  password: string;
  role?: UserRoleValue;
  first_name?: string;
  last_name?: string;
  department?: string; // Добавлено: из бэкенда
  phone?: string; // Добавлено: из бэкенда
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: UserRoleValue;
  password?: string;
  first_name?: string;
  last_name?: string;
  department?: string; // Добавлено: из бэкенда
  phone?: string; // Добавлено: из бэкенда
}

export interface UserWithStats extends User {
  authored_requirements_count: number; // Как в бэкенде
  modified_requirements_count: number; // Как в бэкенде  
  comments_count: number; // Как в бэкенде
}

// =============================================================================
// Auth Response Types (точно как в backend/app/schemas/auth.py)
// =============================================================================

export interface UserProfile {
  id: number; // Исправлено: было string
  username: string;
  email: string;
  name?: string;
  role: UserRoleValue;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login?: string;
  permissions?: string[];
  
  // UI расширения (не в бэкенде)
  avatar?: string;
  first_name?: string;
  last_name?: string;
}

// =============================================================================
// UI Extended Types (расширения для фронтенда)
// =============================================================================

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  accept_terms: boolean;
}

export interface UserPreferences {
  id: number; // Исправлено: было string
  user_id: number; // Исправлено: было string
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard_settings: {
    default_view: string;
    widgets: string[];
  };
}

export interface UserSession {
  id: number; // Исправлено: было string
  user_id: number; // Исправлено: было string
  token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface UserSettings {
  id: number; // Исправлено: было string
  user_id: number; // Исправлено: было string
  privacy: {
    profile_visibility: "public" | "private" | "team";
    activity_visibility: "public" | "private" | "team";
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
  };
  display: {
    items_per_page: number;
    date_format: string;
    time_format: string;
  };
}

// =============================================================================
// Comment Types (для совместимости)
// =============================================================================

export interface Comment {
  id: number;
  content: string;
  requirement_id: number; // Как в backend/app/schemas/comment.py
  author_id: number; // Как в backend/app/schemas/comment.py
  created_at: string;
  updated_at?: string;
  is_internal?: boolean;
  is_edited?: boolean;
  version?: number;
}

export interface CommentCreate {
  content: string;
  requirement_id: number; // Как в бэкенде
  author_id?: number;
}

export interface CommentUpdate {
  content?: string;
}

export interface CommentWithAuthor extends Comment {
  author_name?: string; // Как в backend/app/schemas/comment.py
  author_email?: string; // Как в backend/app/schemas/comment.py  
  requirement_title?: string; // Как в backend/app/schemas/comment.py
}

// =============================================================================
// Deprecated interfaces (для обратной совместимости)
// =============================================================================

// Старые интерфейсы - постепенно удалить
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserStatus {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  is_deleted: boolean;
  is_suspended: boolean;
  is_pending: boolean;
}

// API functions
export const userApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch("/api/v1/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    return response.json();
  },

  // Update current user
  updateCurrentUser: async (data: UserUpdate): Promise<User> => {
    const response = await fetch("/api/v1/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update current user");
    }

    return response.json();
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  },

  // Get users list
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role_id?: string;
    status_id?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`/api/v1/users/?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get users");
    }

    return response.json();
  },

  // Create user
  createUser: async (data: UserCreate): Promise<User> => {
    const response = await fetch("/api/v1/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return response.json();
  },

  // Update user
  updateUser: async (userId: string, data: UserUpdate): Promise<User> => {
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json();
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },

  // Activate user
  activateUser: async (userId: string): Promise<User> => {
    const response = await fetch(`/api/v1/users/${userId}/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to activate user");
    }

    return response.json();
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<User> => {
    const response = await fetch(`/api/v1/users/${userId}/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to deactivate user");
    }

    return response.json();
  },
};
