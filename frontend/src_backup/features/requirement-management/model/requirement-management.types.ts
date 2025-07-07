import type {
  Requirement,
  RequirementWithDetails,
  RequirementCreate,
  RequirementUpdate,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RequirementComment,
  TraceMatrix,
  RequirementFilters,
  RequirementExtended
} from '@/entities/requirement';

// Feature-level state interfaces
export interface RequirementManagementDashboardState {
  requirements: RequirementExtended[];
  stats: RequirementAnalyticsData | null;
  recentActivity: RequirementActivity[];
  coverage: RequirementCoverageData | null;
  summary: RequirementsSummary;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface RequirementTraceabilityState {
  matrix: TraceMatrix | null;
  coverage: TraceabilityCoverage | null;
  orphanedRequirements: number[];
  gaps: TraceabilityGap[];
  selectedRequirement: number | null;
  viewMode: 'matrix' | 'tree' | 'graph';
  isLoading: boolean;
  error: string | null;
}

export interface RequirementWorkflowState {
  currentRequirement: RequirementExtended | null;
  workflowSteps: RequirementWorkflowStep[];
  approvals: RequirementApproval[];
  reviews: RequirementReview[];
  progression: RequirementProgression;
  isLoading: boolean;
  error: string | null;
}

// Extended analytics data
export interface RequirementAnalyticsData {
  totalRequirements: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  completionRate: number;
  overdueCount: number;
  testCoverage: number;
  approvalRate: number;
  trends: {
    newRequirements: number;
    completedRequirements: number;
    avgProcessingTime: number;
    qualityScore: number;
    velocityTrend: 'up' | 'down' | 'stable';
  };
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
  complexityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  businessValueMetrics: {
    highValue: number;
    mediumValue: number;
    lowValue: number;
    avgBusinessValue: number;
  };
}

// Requirement activity tracking
export interface RequirementActivity {
  id: string;
  type: 'created' | 'updated' | 'approved' | 'status_changed' | 'comment_added' | 'test_added' | 'relationship_added';
  requirementId: number;
  requirementTitle: string;
  description: string;
  timestamp: string;
  userId: number;
  userName?: string;
  metadata?: Record<string, any>;
}

// Requirement summary for dashboard
export interface RequirementsSummary {
  totalActive: number;
  overdue: number;
  inReview: number;
  approved: number;
  testCoverage: number;
  riskScore: 'low' | 'medium' | 'high';
}

// Test coverage data
export interface RequirementCoverageData {
  overall_coverage: number;
  by_requirement_type: Record<string, number>;
  uncovered_requirements: number[];
  critical_uncovered: number;
  coverage_trend: 'improving' | 'declining' | 'stable';
  coverage_by_priority: Record<string, number>;
  test_execution_rate: number;
  defect_density: number;
}

// Traceability interfaces
export interface TraceabilityCoverage {
  forward_coverage: number;
  backward_coverage: number;
  bidirectional_coverage: number;
  orphaned_count: number;
  circular_dependencies: number;
}

export interface TraceabilityGap {
  requirement_id: number;
  gap_type: 'no_children' | 'no_parents' | 'circular_dependency' | 'missing_tests' | 'incomplete_trace';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendation: string;
}

// Workflow and progression
export interface RequirementWorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  description: string;
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
  artifacts: WorkflowArtifact[];
}

export interface ApprovalRequirement {
  role: string;
  required: boolean;
  approvedBy?: number;
  approvedAt?: string;
  notes?: string;
  approval_type: 'technical' | 'business' | 'legal' | 'security';
}

export interface CompletionCriterion {
  id: string;
  description: string;
  status: 'pending' | 'completed' | 'not_applicable';
  verifiedBy?: number;
  verifiedAt?: string;
  evidence?: string;
}

export interface RequirementApproval {
  id: string;
  requirementId: number;
  approverRole: string;
  approverId: number;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvalType: 'business' | 'technical' | 'legal' | 'security' | 'final';
  notes?: string;
  approvedAt?: string;
  conditions?: string[];
  expiresAt?: string;
}

export interface RequirementReview {
  id: string;
  requirementId: number;
  reviewerId: number;
  reviewerName: string;
  reviewType: 'peer' | 'technical' | 'business' | 'quality';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  findings: ReviewFinding[];
  overallRating: 1 | 2 | 3 | 4 | 5;
  recommendation: 'approve' | 'approve_with_changes' | 'reject' | 'needs_more_info';
  completedAt?: string;
  estimatedCompletionDate?: string;
}

export interface ReviewFinding {
  id: string;
  category: 'clarity' | 'completeness' | 'consistency' | 'feasibility' | 'testability';
  severity: 'info' | 'minor' | 'major' | 'critical';
  description: string;
  recommendation?: string;
  status: 'open' | 'addressed' | 'acknowledged' | 'disputed';
  addressedBy?: number;
  addressedAt?: string;
}

export interface RequirementProgression {
  currentPhase: RequirementPhase;
  phases: RequirementPhaseInfo[];
  overallProgress: number; // 0-100
  nextMilestone?: RequirementMilestone;
  blockedBy: string[];
  canProceed: boolean;
  estimatedCompletion?: string;
}

export interface RequirementPhase {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface RequirementPhaseInfo extends RequirementPhase {
  description: string;
  startDate?: string;
  endDate?: string;
  progress: number; // 0-100
  deliverables: string[];
  criteria: string[];
}

export interface RequirementMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'at_risk' | 'completed' | 'missed';
  dependencies: string[];
  deliverables: string[];
  criticalPath: boolean;
}

export interface WorkflowArtifact {
  id: string;
  name: string;
  type: 'document' | 'diagram' | 'prototype' | 'test_case' | 'specification';
  url?: string;
  status: 'draft' | 'review' | 'approved';
  createdBy: number;
  createdAt: string;
}

// Filter and view configurations
export interface RequirementManagementFilters extends RequirementFilters {
  risk_level?: ('low' | 'medium' | 'high' | 'critical')[];
  complexity?: ('low' | 'medium' | 'high')[];
  business_value?: ('low' | 'medium' | 'high' | 'very_high')[];
  test_coverage?: 'covered' | 'uncovered' | 'partial';
  approval_status?: ('pending' | 'approved' | 'rejected')[];
  has_relationships?: boolean;
  has_comments?: boolean;
  effort_range?: [number, number]; // hours
  source?: string[];
}

export interface RequirementViewConfig {
  layout: 'grid' | 'list' | 'kanban' | 'timeline' | 'tree';
  groupBy: 'status' | 'priority' | 'type' | 'assignee' | 'risk_level' | 'complexity';
  sortBy: 'title' | 'created_at' | 'updated_at' | 'priority' | 'deadline' | 'risk_score';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  showArchived: boolean;
  showRelationships: boolean;
  showTestCoverage: boolean;
  filters: RequirementManagementFilters;
}

// Action types for state management
export type RequirementManagementAction =
  | { type: 'LOAD_DASHBOARD_START' }
  | { type: 'LOAD_DASHBOARD_SUCCESS'; payload: Omit<RequirementManagementDashboardState, 'isLoading' | 'error'> }
  | { type: 'LOAD_DASHBOARD_ERROR'; payload: string }
  | { type: 'UPDATE_REQUIREMENT_STATUS'; payload: { requirementId: number; status: string } }
  | { type: 'ADD_REQUIREMENT_ACTIVITY'; payload: RequirementActivity }
  | { type: 'SET_TRACEABILITY_VIEW'; payload: RequirementTraceabilityState['viewMode'] }
  | { type: 'SELECT_REQUIREMENT'; payload: number | null }
  | { type: 'ADD_REQUIREMENT_APPROVAL'; payload: RequirementApproval }
  | { type: 'UPDATE_WORKFLOW_STEP'; payload: { stepId: string; status: RequirementWorkflowStep['status'] } }
  | { type: 'SET_FILTERS'; payload: RequirementManagementFilters }
  | { type: 'SET_VIEW_CONFIG'; payload: RequirementViewConfig }
  | { type: 'REFRESH_DATA' };

// Configuration constants
export const REQUIREMENT_MANAGEMENT_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_RECENT_ACTIVITIES: 100,
  DEFAULT_PAGE_SIZE: 25,
  TRACE_DEPTH_LIMIT: 5,
  WORKFLOW_PHASES: [
    { id: 'analysis', name: 'Analysis', order: 1 },
    { id: 'specification', name: 'Specification', order: 2 },
    { id: 'review', name: 'Review', order: 3 },
    { id: 'approval', name: 'Approval', order: 4 },
    { id: 'implementation', name: 'Implementation', order: 5 },
    { id: 'testing', name: 'Testing', order: 6 },
    { id: 'acceptance', name: 'Acceptance', order: 7 }
  ],
  PRIORITY_WEIGHTS: {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  },
  COMPLEXITY_FACTORS: {
    description_length: 0.3,
    relationship_count: 0.2,
    technical_complexity: 0.3,
    business_impact: 0.2
  }
} as const;

// Export permission constants
export const REQUIREMENT_MANAGEMENT_PERMISSIONS = {
  VIEW_REQUIREMENTS: 'requirement_management.view',
  CREATE_REQUIREMENT: 'requirement_management.create',
  EDIT_REQUIREMENT: 'requirement_management.edit',
  DELETE_REQUIREMENT: 'requirement_management.delete',
  APPROVE_REQUIREMENT: 'requirement_management.approve',
  MANAGE_RELATIONSHIPS: 'requirement_management.relationships',
  VIEW_TRACEABILITY: 'requirement_management.traceability',
  BULK_OPERATIONS: 'requirement_management.bulk_ops',
  EXPORT_REQUIREMENTS: 'requirement_management.export',
  IMPORT_REQUIREMENTS: 'requirement_management.import',
  MANAGE_WORKFLOW: 'requirement_management.workflow',
  VIEW_ANALYTICS: 'requirement_management.analytics'
} as const;

// UI specific types
export interface RequirementManagementTabConfig {
  id: string;
  label: string;
  icon: string;
  component: string;
  permission?: string;
}

export interface RequirementAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  requirementId?: number;
  actionLabel?: string;
  actionUrl?: string;
  dismissible: boolean;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RequirementMetricsCard {
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
  drillDownUrl?: string;
}

// Export operation results
export interface BulkRequirementOperationResult {
  updated: number;
  failed: number;
  total: number;
  errors: Array<{
    requirementId: number;
    requirementTitle: string;
    error: string;
  }>;
  summary: string;
}

export interface RequirementExportOptions {
  format: 'excel' | 'csv' | 'pdf' | 'word';
  includeComments: boolean;
  includeRelationships: boolean;
  includeTestResults: boolean;
  includeTraceability: boolean;
  includeApprovals: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  requirementIds?: number[];
  projectId?: number;
}

export interface RequirementImportOptions {
  updateExisting: boolean;
  createMissingReferences: boolean;
  validateDuplicates: boolean;
  autoAssignIds: boolean;
  defaultPriority?: number;
  defaultStatus?: number;
  defaultType?: number;
  projectId: number;
}

export interface RequirementImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  created_requirements: number[];
  updated_requirements: number[];
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  warnings: string[];
  summary: string;
}

// Form interfaces
export interface RequirementCreateFormData extends RequirementCreate {
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  risk_assessment?: string;
  complexity_rating?: 'low' | 'medium' | 'high';
  estimated_effort?: number;
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
  notification_settings?: {
    notify_on_status_change: boolean;
    notify_stakeholders: boolean;
    channels: string[];
  };
}

export interface RequirementUpdateFormData extends RequirementUpdate {
  reason?: string;
  notify_stakeholders?: boolean;
  update_relationships?: boolean;
  increment_version?: boolean;
}

// Quality metrics
export interface RequirementQualityMetrics {
  completeness_score: number; // 0-100
  clarity_score: number; // 0-100
  consistency_score: number; // 0-100
  testability_score: number; // 0-100
  traceability_score: number; // 0-100
  overall_quality_score: number; // 0-100
  quality_issues: QualityIssue[];
}

export interface QualityIssue {
  id: string;
  category: 'completeness' | 'clarity' | 'consistency' | 'testability' | 'traceability';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  suggestion: string;
  auto_fixable: boolean;
  field_reference?: string;
}

// Collaboration features
export interface RequirementCollaboration {
  watchers: CollaborationUser[];
  contributors: CollaborationUser[];
  recent_editors: CollaborationUser[];
  permission_level: 'view' | 'comment' | 'edit' | 'approve';
  sharing_settings: {
    public: boolean;
    teams: string[];
    users: number[];
  };
}

export interface CollaborationUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  last_activity: string;
  contribution_type: 'author' | 'editor' | 'reviewer' | 'approver' | 'watcher';
} 