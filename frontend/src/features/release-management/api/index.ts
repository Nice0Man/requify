// Export release management API
export { ReleaseManagementApi, releaseManagementApi } from './release-management.api';

// Re-export types from entity for convenience  
export type {
  Release,
  ReleaseCreate,
  ReleaseUpdate,
  ReleaseExtended,
  ReleaseWithDetailsExtended,
  ReleaseCreateFromRequirements,
  ReleaseFilters,
  ReleaseStats,
  ReleaseEnvironment,
  ReleaseApproval,
  ReleaseChangelog,
  ChangeLogEntry,
  ReleaseSpecification,
  ReleaseArtifact,
  ChangeType,
  ApprovalRole
} from '@/entities/release'; 