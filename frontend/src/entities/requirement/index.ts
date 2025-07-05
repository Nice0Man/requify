// Export requirement entity types
export type {
  Requirement,
  RequirementBase,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementType,
  RequirementPriority as RequirementPriorityType,
  RequirementStatus as RequirementStatusType,
  RequirementRelationship,
  RelationshipCreate,
  RelationshipCreateForRequirement,
  RequirementComment,
  TraceMatrix,
  TraceNode,
  TraceLink,
  QuickRequirement,
} from "./model/types";

// Export requirement constants and helpers
export {
  getRequirementProgress,
  isRequirementOverdue,
  getRequirementPriorityColor,
  getRequirementStatusColor,
  formatRequirementDeadline,
} from "./model/types";

// Export requirement hooks
export {
  useRequirementProgress,
  useProgressStats,
} from "./model/hooks";

// Export requirement API
export { RequirementsApi, requirementsApi } from "./api";

// Export requirement UI components
export { 
  RequirementCard, 
  RequirementStatus, 
  RequirementPriority, 
  RequirementInfo,
  RequirementProgress,
} from "./ui"; 