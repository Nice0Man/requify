// Export project entity types and API
export type {
  Project,
  ProjectBase,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectStatus,
  ProjectStatusRu,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "./model/types";

// Export project API if needed
export { projectsApi } from "./api/projects.api"; 