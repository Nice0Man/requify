// Dashboard Entity Types
export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon?: string;
  color?: string;
  description?: string;
  category?: MetricCategory;
  unit?: string;
  target?: number;
  lastUpdated?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRequirements: number;
  activeRequirements: number;
  completedTasks: number;
  teamMembers: number;
  completionRate: number;
  teamVelocity: number;
  changes: {
    [key: string]: number;
  };
  trends: {
    [key: string]: TrendData;
  };
  timestamp: string;
}

export interface TrendData {
  current: number;
  previous: number;
  percentage: number;
  direction: "up" | "down" | "stable";
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  status?: ActivityStatus;
  priority?: Priority;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  responseTime: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastCheck: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: "online" | "offline" | "degraded";
  responseTime?: number;
  lastCheck: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: string;
  path: string;
  color?: string;
  category?: ActionCategory;
  shortcut?: string;
  badge?: number;
  isNew?: boolean;
  isDisabled?: boolean;
  permissions?: string[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  size: WidgetSize;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: WidgetConfig;
  isVisible: boolean;
  isLoading?: boolean;
  error?: string;
}

export interface WidgetConfig {
  refreshInterval?: number;
  dataSource?: string;
  filters?: Record<string, any>;
  displayOptions?: {
    showHeader?: boolean;
    showFooter?: boolean;
    showBorder?: boolean;
    theme?: "light" | "dark" | "auto";
  };
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  columns: number;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPreferences {
  layout: string;
  theme: "light" | "dark" | "auto";
  refreshInterval: number;
  showWelcome: boolean;
  defaultView: DashboardView;
  notifications: {
    enabled: boolean;
    types: NotificationType[];
  };
  shortcuts: Record<string, string>;
}

// Enums
export enum MetricCategory {
  PROJECTS = "projects",
  REQUIREMENTS = "requirements",
  TEAM = "team",
  PERFORMANCE = "performance",
  QUALITY = "quality",
}

export enum ActivityType {
  PROJECT_CREATED = "project_created",
  PROJECT_UPDATED = "project_updated",
  REQUIREMENT_CREATED = "requirement_created",
  REQUIREMENT_UPDATED = "requirement_updated",
  REQUIREMENT_APPROVED = "requirement_approved",
  RELEASE_CREATED = "release_created",
  RELEASE_PUBLISHED = "release_published",
  TEST_EXECUTED = "test_executed",
  USER_JOINED = "user_joined",
  COMMENT_ADDED = "comment_added",
  TEST_CASE_CREATED = "TEST_CASE_CREATED",
  USER_CREATED = "USER_CREATED",
  REQUIREMENT_DELETED = "REQUIREMENT_DELETED",
  PROJECT_DELETED = "PROJECT_DELETED",
  TEAM_UPDATED = "TEAM_UPDATED",
  TEAM_DELETED = "TEAM_DELETED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
}

export enum ActivityStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ActionCategory {
  CREATE = "create",
  MANAGE = "manage",
  ANALYZE = "analyze",
  COLLABORATE = "collaborate",
}

export enum WidgetType {
  METRICS = "metrics",
  CHART = "chart",
  LIST = "list",
  ACTIVITY = "activity",
  QUICK_ACTIONS = "quick_actions",
  SYSTEM_HEALTH = "system_health",
  CALENDAR = "calendar",
  PROGRESS = "progress",
}

export enum WidgetSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  FULL = "full",
}

export enum DashboardView {
  OVERVIEW = "overview",
  ANALYTICS = "analytics",
  PROJECTS = "projects",
  REQUIREMENTS = "requirements",
  TEAM = "team",
}

export enum NotificationType {
  PROJECT_UPDATES = "project_updates",
  REQUIREMENT_CHANGES = "requirement_changes",
  SYSTEM_ALERTS = "system_alerts",
  TEAM_ACTIVITIES = "team_activities",
  DEADLINE_REMINDERS = "deadline_reminders",
}

// Response Types
export interface DashboardStatsResponse {
  data: DashboardStats;
  success: boolean;
  timestamp: string;
}

export interface ActivityResponse {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface QuickActionsResponse {
  data: QuickAction[];
  categories: ActionCategory[];
}

// Request Types
export interface ActivityFilters {
  type?: ActivityType[];
  status?: ActivityStatus[];
  priority?: Priority[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface MetricsFilters {
  category?: MetricCategory[];
  period?: "1h" | "24h" | "7d" | "30d" | "90d";
  includeComparisons?: boolean;
} 