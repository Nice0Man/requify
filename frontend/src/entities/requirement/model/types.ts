// Requirement entity types - используют контракты из shared/api
// В соответствии с принципами FSD, entities используют типы из shared

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
  CommentCreate as CommentCreateSchema,
  CommentCreateForRequirement as CommentCreateForRequirementSchema,
  CommentUpdate as CommentUpdateSchema,
  CommentWithAuthor as CommentWithAuthorSchema,
} from '@/shared/api/types';

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
export type RelationshipCreateForRequirement = RelationshipCreateForRequirementSchema;
export type RelationshipUpdate = RelationshipUpdateSchema;
export type RequirementRelationshipWithDetails = RelationshipWithDetailsSchema;
export type RelationshipType = RelationshipTypeSchema;

// =============================================================================
// Comment Types (re-export from API)
// =============================================================================

export type RequirementComment = CommentSchema;
export type CommentCreate = CommentCreateSchema;
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
  risk_level?: ('low' | 'medium' | 'high' | 'critical')[];
  complexity?: ('low' | 'medium' | 'high')[];
}

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface RequirementExtended extends RequirementWithDetails {
  // UI specific fields
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const getRequirementProgress = (requirement: RequirementWithTestResults): number => {
  if (requirement.test_count === 0) return 0;
  return Math.round((requirement.tests_passed / requirement.test_count) * 100);
};

export const isRequirementOverdue = (requirement: Requirement): boolean => {
  if (!requirement.deadline) return false;
  const deadline = new Date(requirement.deadline);
  const now = new Date();
  return deadline < now;
};

export const getRequirementPriorityColor = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case 'critical': return '#ff4d4f';
    case 'high': return '#fa8c16';
    case 'medium': return '#fadb14';
    case 'low': return '#52c41a';
    default: return '#d9d9d9';
  }
};

export const getRequirementStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'new': return '#1890ff';
    case 'in_progress': return '#fadb14';
    case 'review': return '#722ed1';
    case 'approved': return '#52c41a';
    case 'completed': return '#389e0d';
    case 'rejected': return '#ff4d4f';
    case 'cancelled': return '#8c8c8c';
    default: return '#d9d9d9';
  }
};

export const formatRequirementDeadline = (deadline?: string): string => {
  if (!deadline) return 'Не установлен';
  
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Просрочен на ${Math.abs(diffDays)} дн.`;
  } else if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Завтра';
  } else if (diffDays <= 7) {
    return `Через ${diffDays} дн.`;
  } else {
    return date.toLocaleDateString('ru-RU');
  }
}; 