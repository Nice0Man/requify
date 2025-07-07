export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  ANALYST = 'analyst',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  VIEWER = 'viewer'
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserListResponse {
  users: UserDTO[];
  total: number;
  page: number;
  limit: number;
} 
