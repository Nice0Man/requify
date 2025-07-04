import { ReactNode } from 'react';

// Activity Feed Widget
export interface ActivityFeedProps {
  limit?: number;
  showFilters?: boolean;
  className?: string;
  onActivityClick?: (activityId: string) => void;
}

// Dashboard Stats Widget  
export interface DashboardStatsProps {
  layout?: 'grid' | 'horizontal' | 'vertical';
  showTrends?: boolean;
  className?: string;
  onStatClick?: (statType: string) => void;
}

// Navigation Widget
export interface NavigationProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  activeItem?: string;
}

// Project Overview Widget
export interface ProjectOverviewProps {
  projectId?: number;
  showDetails?: boolean;
  showProgress?: boolean;
  className?: string;
  onProjectClick?: (projectId: number) => void;
}

// Requirement List Widget
export interface RequirementListProps {
  projectId?: number;
  limit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
  onRequirementClick?: (requirementId: number) => void;
}

// System Health Widget
export interface SystemHealthProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  onHealthClick?: (component: string) => void;
}

// Quick Actions Widget
export interface QuickActionsProps {
  actions?: string[];
  layout?: 'grid' | 'list';
  className?: string;
  onActionClick?: (action: string) => void;
}

// Kanban Widget
export interface KanbanProps {
  mode?: 'requirements' | 'projects' | 'tasks';
  projectId?: number;
  columns?: KanbanColumn[];
  showFilters?: boolean;
  allowDragDrop?: boolean;
  className?: string;
  onItemClick?: (itemId: number, itemType: string) => void;
  onItemMove?: (itemId: number, fromColumn: string, toColumn: string) => void;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  status?: string;
  limit?: number;
}

export interface KanbanItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  created_at: string;
  updated_at?: string;
  type: 'requirement' | 'project' | 'task';
  labels?: string[];
  estimate?: number;
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