// Requirement entity types - use contracts from shared/api
// According to FSD principles, entities use types from shared

import type {
  Requirement as RequirementSchema,
  RequirementCreate as RequirementCreateSchema,
  RequirementUpdate as RequirementUpdateSchema,
  RequirementWithDetails as RequirementWithDetailsSchema,
  RequirementWithTestResults as RequirementWithTestResultsSchema,
  RequirementBase as RequirementBaseSchema,
  RequirementType as RequirementTypeSchema,
  RequirementPriority as RequirementPrioritySchema,
  RequirementStatus as RequirementStatusSchema,
  Relationship as RelationshipSchema,
  RelationshipCreate as RelationshipCreateSchema,
  RelationshipCreateForRequirement as RelationshipCreateForRequirementSchema,
  RelationshipUpdate as RelationshipUpdateSchema,
  RelationshipWithDetails as RelationshipWithDetailsSchema,
  RelationshipType as RelationshipTypeSchema,
  QuickRequirement,
  TraceNode,
  TraceLink,
  TraceMatrix,
  Comment as CommentSchema,
  CommentCreateForRequirement as CommentCreateForRequirementSchema,
  CommentUpdate as CommentUpdateSchema,
  CommentWithAuthor as CommentWithAuthorSchema,
} from "@/shared/api/requirement";

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type RequirementBase = RequirementBaseSchema;
export type Requirement = RequirementSchema;
export type RequirementCreate = RequirementCreateSchema;
export type RequirementUpdate = RequirementUpdateSchema;
export type RequirementWithDetails = RequirementWithDetailsSchema;
export type RequirementWithTestResults = RequirementWithTestResultsSchema;

// =============================================================================
// Reference Types (re-export from API)
// =============================================================================

export type RequirementType = RequirementTypeSchema;
export type RequirementPriority = RequirementPrioritySchema;
export type RequirementStatus = RequirementStatusSchema;

// =============================================================================
// Relationship Types (re-export from API)
// =============================================================================

export type RequirementRelationship = RelationshipSchema;
export type RelationshipCreate = RelationshipCreateSchema;
export type RelationshipCreateForRequirement =
  RelationshipCreateForRequirementSchema;
export type RelationshipUpdate = RelationshipUpdateSchema;
export type RequirementRelationshipWithDetails = RelationshipWithDetailsSchema;
export type RelationshipType = RelationshipTypeSchema;

// =============================================================================
// Comment Types (requirement-specific only)
// =============================================================================

export type RequirementComment = CommentSchema;
export type CommentCreateForRequirement = CommentCreateForRequirementSchema;
export type CommentUpdate = CommentUpdateSchema;
export type CommentWithAuthor = CommentWithAuthorSchema;

// =============================================================================
// Dashboard Types (re-export from API)
// =============================================================================

export type { QuickRequirement };

// =============================================================================
// Trace Matrix Types (re-export from API)
// =============================================================================

export type { TraceNode, TraceLink, TraceMatrix };

// =============================================================================
// UI State Types (UI specific)
// =============================================================================

export interface RequirementState {
  requirements: Requirement[];
  currentRequirement: Requirement | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface RequirementFilters {
  search?: string;
  project_id?: number;
  type_ids?: number[];
  priority_ids?: number[];
  status_ids?: number[];
  author_id?: number;
  assigned_to?: number;
  release_id?: number;
  spec_id?: number;
  created_from?: string;
  created_to?: string;
  deadline_from?: string;
  deadline_to?: string;
  tags?: string[];
  risk_level?: ("low" | "medium" | "high" | "critical")[];
  complexity?: ("low" | "medium" | "high")[];
}

// =============================================================================
// Extended UI Types (not in API, UI only)
// =============================================================================

export interface RequirementExtended extends RequirementWithDetails {
  // UI specific fields
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: "low" | "medium" | "high" | "critical";
  complexity?: "low" | "medium" | "high";
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const getRequirementProgress = (
  requirement: RequirementWithTestResults
): number => {
  if (!requirement.test_results || requirement.test_results.length === 0)
    return 0;
  return Math.round(
    (requirement.test_results?.filter((test) => test.status === "passed")
      .length /
      requirement.test_results?.length) *
      100
  );
};

export const isRequirementOverdue = (requirement: Requirement): boolean => {
  if (!requirement.deadline) return false;
  const deadline = new Date(requirement.deadline);
  const now = new Date();
  return deadline < now;
};

const priorityColorMap = new Map([
  ["critical", "#ff4d4f"],
  ["high", "#fa8c16"],
  ["medium", "#fadb14"],
  ["low", "#52c41a"],
]);

export const getRequirementPriorityColor = (priority?: string): string => {
  return priorityColorMap.get(priority?.toLowerCase() || "") || "#d9d9d9";
};

const statusColorMap = new Map([
  ["new", "#1890ff"],
  ["in_progress", "#fadb14"],
  ["review", "#722ed1"],
  ["approved", "#52c41a"],
  ["completed", "#389e0d"],
  ["rejected", "#ff4d4f"],
  ["cancelled", "#8c8c8c"],
]);

export const getRequirementStatusColor = (status?: string): string => {
  return statusColorMap.get(status?.toLowerCase() || "") || "#d9d9d9";
};

export const formatRequirementDeadline = (deadline?: string): string => {
  if (!deadline) return "Not set";

  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else {
    return date.toLocaleDateString("en-US");
  }
};
