"""
Импорт всех схем Pydantic.
"""

# User schemas
from .user import (
    User,
    UserCreate,
    UserUpdate,
    UserInDB,
    UserBase,
    UserInDBBase,
    UserWithStats,
)

# Team schemas
from .team import (
    TeamBase,
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamDetailResponse,
    TeamListResponse,
    TeamMemberBase,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberResponse,
    TeamSearchRequest,
    TeamStats,
    TeamMemberStats,
    TeamBulkCreate,
    TeamBulkUpdate,
    TeamBulkDelete,
    TeamMemberBulkAdd,
    TeamMemberBulkRemove,
    TeamMemberBulkUpdate,
    TeamPermissionCheck,
    TeamPermissionResponse,
)

# Auth schemas
from .auth import (
    UserProfile,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutRequest,
    LogoutResponse,
    PasswordChangeRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    TokenValidationRequest,
    TokenValidationResponse,
    SessionListResponse,
    RevokeSessionRequest,
    AuthError,
)

# Project schemas
from .project import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectInDB,
    ProjectBase,
    ProjectInDBBase,
    ProjectWithStats,
)

# Requirement schemas
from .requirement import (
    Requirement,
    RequirementCreate,
    RequirementUpdate,
    RequirementInDB,
    RequirementBase,
    RequirementInDBBase,
    RequirementWithDetails,
    RequirementWithTestResults,
)

# Release schemas
from .release import (
    Release,
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseInDB,
    ReleaseBase,
    ReleaseInDBBase,
    ReleaseWithRequirements,
    ReleaseWithDetails,
    ReleaseFromRequirementsCreate,
    ReleaseCreationSummary,
    ReleaseWithLinkedRequirements,
    RequirementSummary,
    # Function 12 schemas
    SpecificationGenerationOptions,
    SpecificationGenerationResponse,
    SpecificationGenerationSummary,
)

# Test Result schemas
from .test_result import (
    TestResult,
    TestResultCreate,
    TestResultUpdate,
    TestResultInDB,
    TestResultBase,
    TestResultInDBBase,
    TestResultWithDetails,
    TestStatus,
)

# Test Plan schemas
from .test_plan import (
    TestPlan,
    TestPlanCreate,
    TestPlanUpdate,
    TestPlanInDB,
    TestPlanBase,
    TestPlanInDBBase,
)

# Test Case schemas
from .test_case import (
    TestCase,
    TestCaseCreate,
    TestCaseUpdate,
    TestCaseInDB,
    TestCaseBase,
    TestCaseInDBBase,
    TestExecution,
    TestingSummary,
)

# Comment schemas
from .comment import (
    Comment,
    CommentCreate,
    CommentCreateForRequirement,
    CommentUpdate,
    CommentInDB,
    CommentBase,
    CommentInDBBase,
    CommentWithAuthor,
    CommentStatistics,
)

# Relationship schemas
from .relationship import (
    Relationship,
    RelationshipCreate,
    RelationshipCreateForRequirement,
    RelationshipUpdate,
    RelationshipInDB,
    RelationshipBase,
    RelationshipInDBBase,
    RelationshipWithDetails,
)

# Relationship Type schemas
from .relationship_types import (
    RelationshipType,
    RelationshipTypeCreate,
    RelationshipTypeUpdate,
    RelationshipTypeInDB,
    RelationshipTypeBase,
    RelationshipTypeInDBBase,
)

# Requirement Group schemas
from .requirement_group import (
    RequirementGroup,
    RequirementGroupCreate,
    RequirementGroupUpdate,
    RequirementGroupInDB,
    RequirementGroupBase,
    RequirementGroupInDBBase,
    RequirementGroupWithVersions,
)

# Requirement Group Version schemas
from .requirement_group_version import (
    RequirementGroupVersion,
    RequirementGroupVersionCreate,
    RequirementGroupVersionUpdate,
    RequirementGroupVersionInDB,
    RequirementGroupVersionBase,
    RequirementGroupVersionInDBBase,
    RequirementGroupVersionWithDetails,
)

# Requirement Priority schemas
from .requirement_priorities import (
    RequirementPriority,
    RequirementPriorityCreate,
    RequirementPriorityUpdate,
    RequirementPriorityInDB,
    RequirementPriorityBase,
    RequirementPriorityInDBBase,
)

# Requirement Status schemas
from .requirement_statuses import (
    RequirementStatus,
    RequirementStatusCreate,
    RequirementStatusUpdate,
    RequirementStatusInDB,
    RequirementStatusBase,
    RequirementStatusInDBBase,
)

# Requirement Type schemas
from .requirement_types import (
    RequirementType,
    RequirementTypeCreate,
    RequirementTypeUpdate,
    RequirementTypeInDB,
    RequirementTypeBase,
    RequirementTypeInDBBase,
)

# Spec schemas
from .spec import (
    Spec,
    SpecCreate,
    SpecUpdate,
    SpecInDB,
    SpecBase,
    SpecInDBBase,
    SpecWithRequirements,
    SpecDetailed,
)

# Report schemas
from .report import (
    Report,
    ReportCreate,
    ReportUpdate,
    ReportInDB,
    ReportBase,
    ReportInDBBase,
    ReportWithDetails,
    ReportFilter,
    ReportConfig,
    ReportType,
    ReportFormat,
)

# Trace Matrix schemas
from .trace_matrix import (
    TraceMatrix,
    TraceNode,
    TraceLink,
    TraceMatrixConfig,
    TraceMatrixSummary,
    TraceMatrixExport,
)

# Token schemas
from .token import Token, TokenPayload

# Dashboard schemas
from .dashboard import (
    DashboardStats,
    DashboardOverview,
    ProjectPerformance,
    TrendingMetrics,
    ActivityItem,
    MyDashboard,
    MyProject,
    MyRequirement,
    Notification,
    UserPreferences,
)

__all__ = [
    # User
    "User",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserBase",
    "UserInDBBase",
    "UserWithStats",
    # Team
    "TeamBase",
    "TeamCreate",
    "TeamUpdate",
    "TeamResponse",
    "TeamDetailResponse",
    "TeamListResponse",
    "TeamMemberBase",
    "TeamMemberCreate",
    "TeamMemberUpdate",
    "TeamMemberResponse",
    "TeamSearchRequest",
    "TeamStats",
    "TeamMemberStats",
    "TeamBulkCreate",
    "TeamBulkUpdate",
    "TeamBulkDelete",
    "TeamMemberBulkAdd",
    "TeamMemberBulkRemove",
    "TeamMemberBulkUpdate",
    "TeamPermissionCheck",
    "TeamPermissionResponse",
    # Auth
    "UserProfile",
    "LoginRequest",
    "LoginResponse",
    "RefreshTokenRequest",
    "RefreshTokenResponse",
    "LogoutRequest",
    "LogoutResponse",
    "PasswordChangeRequest",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    "TokenValidationRequest",
    "TokenValidationResponse",
    "SessionListResponse",
    "RevokeSessionRequest",
    "AuthError",
    # Project
    "Project",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectInDB",
    "ProjectBase",
    "ProjectInDBBase",
    "ProjectWithStats",
    # Requirement
    "Requirement",
    "RequirementCreate",
    "RequirementUpdate",
    "RequirementInDB",
    "RequirementBase",
    "RequirementInDBBase",
    "RequirementWithDetails",
    "RequirementWithTestResults",
    # Release
    "Release",
    "ReleaseCreate",
    "ReleaseUpdate",
    "ReleaseInDB",
    "ReleaseBase",
    "ReleaseInDBBase",
    "ReleaseWithRequirements",
    "ReleaseWithDetails",
    "ReleaseFromRequirementsCreate",
    "ReleaseCreationSummary",
    "ReleaseWithLinkedRequirements",
    "RequirementSummary",
    # Function 12 schemas
    "SpecificationGenerationOptions",
    "SpecificationGenerationResponse",
    "SpecificationGenerationSummary",
    # Report
    "Report",
    "ReportCreate",
    "ReportUpdate",
    "ReportInDB",
    "ReportBase",
    "ReportInDBBase",
    "ReportWithDetails",
    "ReportFilter",
    "ReportConfig",
    "ReportType",
    "ReportFormat",
    # Test Result
    "TestResult",
    "TestResultCreate",
    "TestResultUpdate",
    "TestResultInDB",
    "TestResultBase",
    "TestResultInDBBase",
    "TestResultWithDetails",
    "TestStatus",
    # Test Plan
    "TestPlan",
    "TestPlanCreate",
    "TestPlanUpdate",
    "TestPlanInDB",
    "TestPlanBase",
    "TestPlanInDBBase",
    # Test Case
    "TestCase",
    "TestCaseCreate",
    "TestCaseUpdate",
    "TestCaseInDB",
    "TestCaseBase",
    "TestCaseInDBBase",
    "TestExecution",
    "TestingSummary",
    # Dashboard
    "DashboardStats",
    "DashboardOverview",
    "ProjectPerformance",
    "TrendingMetrics",
    "ActivityItem",
    "MyDashboard",
    "MyProject",
    "MyRequirement",
    "Notification",
    "UserPreferences",
    # Comment
    "Comment",
    "CommentCreate",
    "CommentCreateForRequirement",
    "CommentUpdate",
    "CommentInDB",
    "CommentBase",
    "CommentInDBBase",
    "CommentWithAuthor",
    "CommentStatistics",
    # Relationship
    "Relationship",
    "RelationshipCreate",
    "RelationshipCreateForRequirement",
    "RelationshipUpdate",
    "RelationshipInDB",
    "RelationshipBase",
    "RelationshipInDBBase",
    "RelationshipWithDetails",
    # Relationship Type
    "RelationshipType",
    "RelationshipTypeCreate",
    "RelationshipTypeUpdate",
    "RelationshipTypeInDB",
    "RelationshipTypeBase",
    "RelationshipTypeInDBBase",
    # Requirement Group
    "RequirementGroup",
    "RequirementGroupCreate",
    "RequirementGroupUpdate",
    "RequirementGroupInDB",
    "RequirementGroupBase",
    "RequirementGroupInDBBase",
    "RequirementGroupWithVersions",
    # Requirement Group Version
    "RequirementGroupVersion",
    "RequirementGroupVersionCreate",
    "RequirementGroupVersionUpdate",
    "RequirementGroupVersionInDB",
    "RequirementGroupVersionBase",
    "RequirementGroupVersionInDBBase",
    "RequirementGroupVersionWithDetails",
    # Requirement Priority
    "RequirementPriority",
    "RequirementPriorityCreate",
    "RequirementPriorityUpdate",
    "RequirementPriorityInDB",
    "RequirementPriorityBase",
    "RequirementPriorityInDBBase",
    # Requirement Status
    "RequirementStatus",
    "RequirementStatusCreate",
    "RequirementStatusUpdate",
    "RequirementStatusInDB",
    "RequirementStatusBase",
    "RequirementStatusInDBBase",
    # Requirement Type
    "RequirementType",
    "RequirementTypeCreate",
    "RequirementTypeUpdate",
    "RequirementTypeInDB",
    "RequirementTypeBase",
    "RequirementTypeInDBBase",
    # Spec
    "Spec",
    "SpecCreate",
    "SpecUpdate",
    "SpecInDB",
    "SpecBase",
    "SpecInDBBase",
    "SpecWithRequirements",
    # Report
    "Report",
    "ReportCreate",
    "ReportUpdate",
    "ReportInDB",
    "ReportBase",
    "ReportInDBBase",
    "ReportWithDetails",
    "ReportFilter",
    "ReportConfig",
    "ReportType",
    "ReportFormat",
    # Trace Matrix
    "TraceMatrix",
    "TraceNode",
    "TraceLink",
    "TraceMatrixConfig",
    "TraceMatrixSummary",
    "TraceMatrixExport",
    # Token
    "Token",
    "TokenPayload",
]
