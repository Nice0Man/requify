// User types and interfaces
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

export interface UserBase {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface User extends UserBase {
  is_active: boolean;
  last_login?: string;
  avatar_url?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role_id?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role_id?: string;
  status_id?: string;
  is_active?: boolean;
}

export interface UserWithStats extends User {
  stats: {
    projects_count: number;
    requirements_count: number;
    releases_count: number;
    last_activity?: string;
  };
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  accept_terms: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  position?: string;
  skills?: string[];
  social_links?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface UserPreferences {
  id: string;
  user_id: string;
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
  id: string;
  user_id: string;
  token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
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

// Comment types and interfaces - контракты для comment API
export interface Comment {
  id: number;
  content: string;
  user_id: number;
  entity_type: string;
  entity_id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  is_internal?: boolean;
  is_edited?: boolean;
  version?: number;
}

export interface CommentCreate {
  content: string;
  entity_type: string;
  entity_id: number;
  parent_id?: number;
  is_internal?: boolean;
}

export interface CommentUpdate {
  content?: string;
  is_internal?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author_id: number;
  author_username: string;
  author_email?: string;
  author_first_name?: string;
  author_last_name?: string;
  author_avatar_url?: string;
  author_is_active: boolean;
}

// User constants
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ANALYST: "analyst",
  DEVELOPER: "developer",
  TESTER: "tester",
  CLIENT: "client",
  VIEWER: "viewer",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
  DELETED: "deleted",
} as const;

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
