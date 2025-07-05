import { ReactNode } from 'react';

// Kanban types
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  status: string;
  limit?: number;
  description?: string;
  icon?: React.ReactNode;
}

export interface KanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  assignees?: string[];
  created_at: string;
  updated_at: string;
  type: "requirement" | "project" | "task";
  labels?: string[];
  progress?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  project_name?: string;
  author?: string;
}

export interface KanbanProps {
  mode?: "requirements" | "projects" | "tasks";
  projectId?: number;
  columns?: KanbanColumn[];
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number, itemType: string) => void;
  onItemMove?: (itemId: number, fromColumn: string, toColumn: string) => void;
  variant?: "compact" | "detailed" | "minimal";
}

// Dashboard types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRequirements: number;
  completedRequirements: number;
  totalTestCases: number;
  passedTestCases: number;
  totalUsers: number;
  activeUsers: number;
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'requirement' | 'test' | 'user';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  title: string;
  description?: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  permissions?: string[];
}

// Quick Actions types
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  disabled?: boolean;
  permissions?: string[];
}

// Project Overview types
export interface ProjectOverview {
  id: number;
  name: string;
  description?: string;
  status: string;
  progress: number;
  requirements: number;
  testCases: number;
  members: number;
  dueDate?: string;
  owner: string;
  tags?: string[];
}

// System Health types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
  }>;
}

// Requirement List types
export interface RequirementListItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  assignee?: string;
  project: string;
  created_at: string;
  updated_at: string;
  progress?: number;
  labels?: string[];
}

// Common widget state
export interface WidgetState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

// Widget configuration
export interface WidgetConfig {
  id: string;
  title: string;
  icon?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'auto';
  refreshable?: boolean;
  configurable?: boolean;
} 