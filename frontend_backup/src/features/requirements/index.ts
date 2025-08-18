// Model exports
export * from "./model";

// API exports (only non-hook exports to avoid duplication)
export { requirementApi, requirementKeys } from "./api/requirementApi";

// Hook exports from API
export {
  useRequirements,
  useRequirement,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
  useRequirementStats,
} from "./api/requirementApi";
