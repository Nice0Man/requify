"""
Автоматический импорт всех схем Pydantic из папки schemas.
"""

# Auth schemas
from .auth import (
    AuthError,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    PasswordChangeRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RevokeSessionRequest,
    SessionListResponse,
    TokenValidationRequest,
    TokenValidationResponse,
    UserProfile,
)

# Comment schemas
from .comment import (
    Comment,
    CommentBase,
    CommentCreate,
    CommentCreateForRequirement,
    CommentInDB,
    CommentInDBBase,
    CommentStatistics,
    CommentUpdate,
    CommentWithAuthor,
)

# Dashboard schemas
from .dashboard import (
    ActivityItem,
    DashboardOverview,
    DashboardStats,
    MyDashboard,
    MyProject,
    MyRequirement,
    Notification,
    ProjectPerformance,
    TrendingMetrics,
    UserPreferences,
)

# Project schemas
from .project import (
    Project,
    ProjectBase,
    ProjectCreate,
    ProjectInDB,
    ProjectInDBBase,
    ProjectUpdate,
    ProjectWithStats,
)

# Relationship schemas
from .relationship import (
    Relationship,
    RelationshipBase,
    RelationshipCreate,
    RelationshipCreateForRequirement,
    RelationshipInDB,
    RelationshipInDBBase,
    RelationshipUpdate,
    RelationshipWithDetails,
)

# Relationship Type schemas
from .relationship_types import (
    RelationshipType,
    RelationshipTypeBase,
    RelationshipTypeCreate,
    RelationshipTypeInDB,
    RelationshipTypeInDBBase,
    RelationshipTypeUpdate,
)

# Release schemas
from .release import (  # Function 12 schemas
    Release,
    ReleaseBase,
    ReleaseCreate,
    ReleaseCreationSummary,
    ReleaseFromRequirementsCreate,
    ReleaseInDB,
    ReleaseInDBBase,
    ReleaseUpdate,
    ReleaseWithDetails,
    ReleaseWithLinkedRequirements,
    ReleaseWithRequirements,
    RequirementSummary,
    SpecificationGenerationOptions,
    SpecificationGenerationResponse,
    SpecificationGenerationSummary,
)

# Report schemas
from .report import (
    Report,
    ReportBase,
    ReportConfig,
    ReportCreate,
    ReportFilter,
    ReportFormat,
    ReportInDB,
    ReportInDBBase,
    ReportType,
    ReportUpdate,
    ReportWithDetails,
)

# Requirement schemas
from .requirement import (
    Requirement,
    RequirementBase,
    RequirementCreate,
    RequirementInDB,
    RequirementInDBBase,
    RequirementUpdate,
    RequirementWithDetails,
    RequirementWithTestResults,
)

# Requirement Group schemas
from .requirement_group import (
    RequirementGroup,
    RequirementGroupBase,
    RequirementGroupCreate,
    RequirementGroupInDB,
    RequirementGroupInDBBase,
    RequirementGroupUpdate,
    RequirementGroupWithVersions,
)

# Requirement Group Version schemas
from .requirement_group_version import (
    RequirementGroupVersion,
    RequirementGroupVersionBase,
    RequirementGroupVersionCreate,
    RequirementGroupVersionInDB,
    RequirementGroupVersionInDBBase,
    RequirementGroupVersionUpdate,
    RequirementGroupVersionWithDetails,
)

# Requirement Priority schemas
from .requirement_priorities import (
    RequirementPriority,
    RequirementPriorityBase,
    RequirementPriorityCreate,
    RequirementPriorityInDB,
    RequirementPriorityInDBBase,
    RequirementPriorityUpdate,
)

# Requirement Status schemas
from .requirement_statuses import (
    RequirementStatus,
    RequirementStatusBase,
    RequirementStatusCreate,
    RequirementStatusInDB,
    RequirementStatusInDBBase,
    RequirementStatusUpdate,
)

# Requirement Type schemas
from .requirement_types import (
    RequirementType,
    RequirementTypeBase,
    RequirementTypeCreate,
    RequirementTypeInDB,
    RequirementTypeInDBBase,
    RequirementTypeUpdate,
)

# Spec schemas
from .spec import (
    Spec,
    SpecBase,
    SpecCreate,
    SpecDetailed,
    SpecInDB,
    SpecInDBBase,
    SpecUpdate,
    SpecWithRequirements,
)

# Team schemas
from .team import (
    TeamBase,
    TeamBulkCreate,
    TeamBulkDelete,
    TeamBulkUpdate,
    TeamCreate,
    TeamDetailResponse,
    TeamListResponse,
    TeamMemberBase,
    TeamMemberBulkAdd,
    TeamMemberBulkRemove,
    TeamMemberBulkUpdate,
    TeamMemberCreate,
    TeamMemberResponse,
    TeamMemberStats,
    TeamMemberUpdate,
    TeamPermissionCheck,
    TeamPermissionResponse,
    TeamResponse,
    TeamSearchRequest,
    TeamStats,
    TeamUpdate,
)

# Test Case schemas
from .test_case import (
    TestCase,
    TestCaseBase,
    TestCaseCreate,
    TestCaseInDB,
    TestCaseInDBBase,
    TestCaseUpdate,
    TestExecution,
    TestingSummary,
)

# Test Plan schemas
from .test_plan import (
    TestPlan,
    TestPlanBase,
    TestPlanCreate,
    TestPlanInDB,
    TestPlanInDBBase,
    TestPlanUpdate,
)

# Test Result schemas
from .test_result import (
    TestResult,
    TestResultBase,
    TestResultCreate,
    TestResultInDB,
    TestResultInDBBase,
    TestResultUpdate,
    TestResultWithDetails,
    TestStatus,
)

# Token schemas
from .token import Token, TokenPayload

# Trace Matrix schemas
from .trace_matrix import (
    TraceLink,
    TraceMatrix,
    TraceMatrixConfig,
    TraceMatrixExport,
    TraceMatrixSummary,
    TraceNode,
)

# User schemas
from .user import (
    User,
    UserBase,
    UserCreate,
    UserInDB,
    UserInDBBase,
    UserUpdate,
    UserWithStats,
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

import os
import importlib
from pathlib import Path

# Получаем путь к текущей директории
current_dir = Path(__file__).parent

# Список для хранения всех экспортируемых элементов
__all__ = []

# Проходим по всем файлам .py в директории schemas
for file_path in current_dir.glob("*.py"):
    # Пропускаем __init__.py и файлы, начинающиеся с подчеркивания
    if file_path.name.startswith("__") or file_path.name.startswith("_"):
        continue

    # Получаем имя модуля без расширения
    module_name = file_path.stem

    try:
        # Импортируем модуль
        module = importlib.import_module(f".{module_name}", package=__name__)

        # Если в модуле есть __all__, используем его
        if hasattr(module, "__all__"):
            for item in module.__all__:
                if hasattr(module, item):
                    globals()[item] = getattr(module, item)
                    __all__.append(item)
        else:
            # Иначе импортируем все публичные атрибуты (не начинающиеся с _)
            for attr_name in dir(module):
                if not attr_name.startswith("_"):
                    attr = getattr(module, attr_name)
                    # Проверяем, что это класс (схема Pydantic обычно является классом)
                    if isinstance(attr, type):
                        globals()[attr_name] = attr
                        __all__.append(attr_name)

    except ImportError as e:
        # Если модуль не удается импортировать, выводим предупреждение
        print(f"Warning: Could not import {module_name}: {e}")
        continue

# Сортируем __all__ для лучшей читаемости
__all__.sort()
