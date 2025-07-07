// Admin entity types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalRequirements: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
} 