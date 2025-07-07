import type {
  Release,
  ReleaseExtended,
  ReleaseStats,
  ReleaseFilters,
  ReleaseCreate,
  ReleaseUpdate,
  ReleaseEnvironment,
  ReleaseApproval,
  ChangeLogEntry,
  ReleaseType
} from '@/entities/release';

// Feature-level state interfaces
export interface ReleaseManagementDashboardState {
  releases: ReleaseExtended[];
  stats: ReleaseAnalyticsData | null;
  upcomingReleases: Release[];
  recentActivity: ReleaseActivity[];
  summary: ReleasesSummary;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ReleasePlanningState {
  timeline: ReleaseTimelineItem[];
  suggestions: ReleasePlanningSuggestions;
  selectedReleaseIds: number[];
  plannerView: 'timeline' | 'kanban' | 'calendar';
  conflicts: ReleaseConflict[];
  isLoading: boolean;
  error: string | null;
}

export interface ReleaseWorkflowState {
  currentRelease: ReleaseExtended | null;
  workflowSteps: ReleaseWorkflowStep[];
  approvals: ReleaseApproval[];
  blockers: ReleaseBlocker[];
  progression: ReleaseProgression;
  isLoading: boolean;
  error: string | null;
}

// Extended analytics data
export interface ReleaseAnalyticsData extends ReleaseStats {
  trends: {
    completionRate: number;
    averageLeadTime: number;
    qualityScore: number;
    velocityTrend: 'up' | 'down' | 'stable';
  };
  riskAssessment: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    overdueReleases: number;
  };
  performanceMetrics: {
    deploymentFrequency: number;
    leadTimeForChanges: number;
    meanTimeToRecovery: number;
    changeFailureRate: number;
  };
}

// Release activity tracking
export interface ReleaseActivity {
  id: string;
  type: 'created' | 'updated' | 'published' | 'status_changed' | 'approved' | 'requirement_added';
  releaseId: number;
  releaseName: string;
  description: string;
  timestamp: string;
  userId: number;
  userName?: string;
  metadata?: Record<string, any>;
}

// Release summary for dashboard
export interface ReleasesSummary {
  totalActive: number;
  overdue: number;
  readyToPublish: number;
  inTesting: number;
  awaitingApproval: number;
  riskScore: 'low' | 'medium' | 'high';
}

// Planning and timeline interfaces
export interface ReleaseTimelineItem {
  release: Release;
  conflicts: string[];
  recommendations: string[];
  resourceUtilization: number;
  dependencies: ReleaseDependencyInfo[];
  milestones: ReleaseMilestone[];
}

export interface ReleasePlanningSuggestions {
  optimalDates: Record<number, string>;
  resourceConflicts: ReleaseResourceConflict[];
  recommendations: PlanningRecommendation[];
}

export interface ReleaseResourceConflict {
  releaseId: number;
  conflictType: 'resource' | 'dependency' | 'timeline';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedResolution?: string;
}

export interface PlanningRecommendation {
  id: string;
  type: 'schedule' | 'resource' | 'dependency' | 'risk';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  releaseIds: number[];
}

// Workflow and progression
export interface ReleaseWorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  requiredApprovals: ApprovalRequirement[];
  completionCriteria: CompletionCriterion[];
  estimatedDuration: number; // in days
  actualDuration?: number;
  dependencies: string[]; // step IDs
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface ApprovalRequirement {
  role: string;
  required: boolean;
  approvedBy?: number;
  approvedAt?: string;
  notes?: string;
}

export interface CompletionCriterion {
  id: string;
  description: string;
  status: 'pending' | 'completed' | 'not_applicable';
  verifiedBy?: number;
  verifiedAt?: string;
}

export interface ReleaseBlocker {
  id: string;
  releaseId: number;
  type: 'technical' | 'resource' | 'dependency' | 'approval' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  reportedBy: number;
  reportedAt: string;
  assignedTo?: number;
  resolvedAt?: string;
  resolution?: string;
  impact: string;
  estimatedResolutionTime?: number; // in hours
}

export interface ReleaseProgression {
  currentPhase: ReleasePhase;
  phases: ReleasePhaseInfo[];
  overallProgress: number; // 0-100
  nextMilestone?: ReleaseMilestone;
  blockedBy: string[];
  canProceed: boolean;
}

export interface ReleasePhase {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface ReleasePhaseInfo extends ReleasePhase {
  description: string;
  startDate?: string;
  endDate?: string;
  progress: number; // 0-100
  requirements: string[];
  deliverables: string[];
}

export interface ReleaseMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'at_risk' | 'completed' | 'missed';
  dependencies: string[];
  deliverables: string[];
  criticalPath: boolean;
}

export interface ReleaseDependencyInfo {
  id: string;
  type: 'internal' | 'external' | 'technical';
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  blocking: boolean;
  criticality: 'low' | 'medium' | 'high';
  estimatedResolution?: string;
  owner?: string;
}

// Filter and view configurations
export interface ReleaseManagementFilters extends ReleaseFilters {
  risk_level?: ('low' | 'medium' | 'high')[];
  completion_range?: [number, number]; // percentage range
  team_id?: number[];
  has_blockers?: boolean;
  approval_status?: ('pending' | 'approved' | 'rejected')[];
  environment?: string[];
}

export interface ReleaseViewConfig {
  layout: 'grid' | 'list' | 'kanban' | 'timeline';
  groupBy: 'status' | 'project' | 'team' | 'risk_level' | 'due_date';
  sortBy: 'name' | 'created_at' | 'planned_date' | 'progress' | 'risk_score';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  showArchived: boolean;
  filters: ReleaseManagementFilters;
}

// Action types for state management
export type ReleaseManagementAction =
  | { type: 'LOAD_DASHBOARD_START' }
  | { type: 'LOAD_DASHBOARD_SUCCESS'; payload: Omit<ReleaseManagementDashboardState, 'isLoading' | 'error'> }
  | { type: 'LOAD_DASHBOARD_ERROR'; payload: string }
  | { type: 'UPDATE_RELEASE_STATUS'; payload: { releaseId: number; status: string } }
  | { type: 'ADD_RELEASE_ACTIVITY'; payload: ReleaseActivity }
  | { type: 'SET_PLANNING_VIEW'; payload: ReleasePlanningState['plannerView'] }
  | { type: 'SELECT_RELEASES'; payload: number[] }
  | { type: 'ADD_RELEASE_BLOCKER'; payload: ReleaseBlocker }
  | { type: 'RESOLVE_RELEASE_BLOCKER'; payload: { blockerId: string; resolution: string } }
  | { type: 'UPDATE_WORKFLOW_STEP'; payload: { stepId: string; status: ReleaseWorkflowStep['status'] } }
  | { type: 'SET_FILTERS'; payload: ReleaseManagementFilters }
  | { type: 'SET_VIEW_CONFIG'; payload: ReleaseViewConfig }
  | { type: 'REFRESH_DATA' };

// Configuration constants
export const RELEASE_MANAGEMENT_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_RECENT_ACTIVITIES: 50,
  DEFAULT_PAGE_SIZE: 20,
  TIMELINE_LOOK_AHEAD_DAYS: 90,
  RISK_THRESHOLDS: {
    HIGH: 80,
    MEDIUM: 50,
    LOW: 20
  },
  PHASES: [
    { id: 'planning', name: 'Planning', order: 1 },
    { id: 'development', name: 'Development', order: 2 },
    { id: 'testing', name: 'Testing', order: 3 },
    { id: 'approval', name: 'Approval', order: 4 },
    { id: 'deployment', name: 'Deployment', order: 5 },
    { id: 'release', name: 'Release', order: 6 }
  ],
  WORKFLOW_TEMPLATES: {
    STANDARD: 'standard',
    HOTFIX: 'hotfix',
    EMERGENCY: 'emergency',
    FEATURE: 'feature'
  }
} as const;

// Export permission constants
export const RELEASE_MANAGEMENT_PERMISSIONS = {
  VIEW_RELEASES: 'release_management.view',
  CREATE_RELEASE: 'release_management.create',
  EDIT_RELEASE: 'release_management.edit',
  DELETE_RELEASE: 'release_management.delete',
  PUBLISH_RELEASE: 'release_management.publish',
  APPROVE_RELEASE: 'release_management.approve',
  MANAGE_PLANNING: 'release_management.planning',
  VIEW_ANALYTICS: 'release_management.analytics',
  MANAGE_WORKFLOW: 'release_management.workflow',
  BULK_OPERATIONS: 'release_management.bulk_ops'
} as const;

// UI specific types
export interface ReleaseManagementTabConfig {
  id: string;
  label: string;
  icon: string;
  component: string;
  permission?: string;
}

export interface ReleaseAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  releaseId?: number;
  actionLabel?: string;
  actionUrl?: string;
  dismissible: boolean;
  timestamp: string;
}

export interface ReleaseMetricsCard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  status?: 'good' | 'warning' | 'critical';
  description?: string;
}

// Export operation results
export interface BulkReleaseOperationResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    releaseId: number;
    releaseName: string;
    error: string;
  }>;
  summary: string;
}

export interface ReleaseExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeRequirements: boolean;
  includeChangelog: boolean;
  includeMetrics: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  releaseIds?: number[];
}

// Form interfaces
export interface ReleaseCreateFormData extends ReleaseCreate {
  workflow_template?: string;
  auto_assign_team?: boolean;
  notification_settings?: {
    notify_on_status_change: boolean;
    notify_stakeholders: boolean;
    channels: string[];
  };
}

export interface ReleaseUpdateFormData extends ReleaseUpdate {
  reason?: string;
  notify_stakeholders?: boolean;
  update_dependent_releases?: boolean;
} 