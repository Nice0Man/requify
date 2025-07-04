// Entities exports - в соответствии с принципами FSD
// Экспортируем только типы и UI-хелперы, не логику

// Project entity
export type {
  ProjectBase,
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectWithDetails,
  ProjectState,
  ProjectFilters,
  ProjectMetrics,
  ProjectStatus,
  ProjectManager,
  ProjectTeamLead,
  ProjectClient,
  QuickProject,
} from './project/model/types';

export {
  PROJECT_STATUSES,
  getProjectCompletionPercentage,
  isProjectCompleted,
  getProjectHealthScore,
} from './project/model/types';

// Requirement entity
export type {
  RequirementBase,
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RelationshipCreate,
  RelationshipCreateForRequirement,
  RelationshipUpdate,
  RequirementRelationshipWithDetails,
  RelationshipType,
  RequirementComment,
  CommentCreate,
  CommentCreateForRequirement,
  CommentUpdate,
  CommentWithAuthor,
  RequirementState,
  RequirementFilters,
  RequirementExtended,
  QuickRequirement,
  TraceNode,
  TraceLink,
  TraceMatrix,
} from './requirement/model/types';

export {
  getRequirementProgress,
  isRequirementOverdue,
  getRequirementPriorityColor,
  getRequirementStatusColor,
  formatRequirementDeadline,
} from './requirement/model/types';

// Release entity
export type {
  ReleaseBase,
  Release,
  ReleaseCreate,
  ReleaseUpdate,
  ReleaseWithStats,
  ReleaseWithDetails,
  ReleaseCreateFromRequirements,
  ReleaseSpecification,
  ReleaseChangelog,
  ReleaseRequirement,
  ReleaseStatus,
  ReleaseState,
  ReleaseFilters,
  ReleaseMetrics,
} from './release/model/types';

export {
  RELEASE_STATUSES,
  getReleaseProgress,
  isReleaseOverdue,
  getReleaseStatusColor,
  formatReleaseDate,
  getReleaseHealthScore,
  canPublishRelease,
  getReleaseVersionSuggestion,
} from './release/model/types';

// User entity
export type {
  UserBase,
  User,
  UserCreate,
  UserUpdate,
  UserWithStats,
  UserWithDetails,
  UserRegistration,
  UserProfile,
  UserPreferences,
  UserSession,
  UserSettings,
  UserRole,
  UserStatus,
  UserState,
  UserFilters,
  UserPermissions,
  TeamMember,
  UserActivity,
} from './user/model/types';

export {
  USER_ROLES,
  USER_STATUSES,
  getUserFullName,
  getUserInitials,
  getUserStatusColor,
  getUserRoleColor,
  isUserActive,
  canUserAccessProject,
  canUserManageProject,
  getUserWorkloadColor,
  formatLastLogin,
} from './user/model/types';

// Test Case entity
export type {
  TestCaseBase,
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseWithResults,
  TestCaseWithDetails,
  TestPlanBase,
  TestPlan,
  TestPlanCreate,
  TestPlanUpdate,
  TestPlanWithStats,
  TestPlanWithDetails,
  TestExecutionBase,
  TestExecution,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestExecutionWithDetails,
  TestResultBase,
  TestResult,
  TestResultCreate,
  TestResultUpdate,
  TestResultWithDetails,
  TestStatus,
  TestPriority,
  TestType,
  TestCaseState,
  TestPlanState,
  TestExecutionState,
  TestCaseFilters,
  TestPlanFilters,
  IntegrationTestJob,
  IntegrationTestStatus,
  TestSummary,
  AutomationScript,
  AutomationResult,
} from './test-case/model/types';

export {
  TEST_STATUSES,
  TEST_PRIORITIES,
  TEST_TYPES,
  getTestStatusColor,
  getTestPriorityColor,
  getTestTypeIcon,
  calculateTestCoverage,
  getTestExecutionDuration,
  getTestPlanProgress,
  getTestPlanSuccessRate,
  isTestCaseAutomatable,
} from './test-case/model/types';

// Comment entity
export type {
  CommentBase,
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentWithAuthor,
  CommentCreateForRequirement,
  CommentStats,
  CommentWithDetails,
  CommentThread,
  CommentState,
  CommentFilters,
  CommentAction,
  CommentReaction,
  CommentNotification,
  CommentFormat,
  CommentDraft,
} from './comment/model/types';

export {
  formatCommentDate,
  getCommentAuthorInitials,
  getCommentAuthorFullName,
  parseCommentMentions,
  renderCommentContent,
  isCommentEditable,
  getCommentWordCount,
  getCommentReadingTime,
} from './comment/model/types';
