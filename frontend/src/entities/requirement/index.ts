// Export requirement entity types and API
export type {
  Requirement,
  RequirementBase,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithStats,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RequirementRelationshipCreate,
  RequirementRelationshipType,
  RequirementComment,
  RequirementStatusRu,
  RequirementPriorityRu,
  RequirementTypeRu,
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_PRIORITY_LABELS,
  REQUIREMENT_TYPE_LABELS,
  REQUIREMENT_STATUS_COLORS,
  REQUIREMENT_PRIORITY_COLORS,
} from "./model/types";

// Export requirement API if needed
export * from "./api/requirements.api"; 