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

# Comment schemas
from .comment import (
    Comment,
    CommentCreate,
    CommentUpdate,
    CommentInDB,
    CommentBase,
    CommentInDBBase,
    CommentWithAuthor,
)

# Relationship schemas
from .relationship import (
    Relationship,
    RelationshipCreate,
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
)

# Token schemas
from .token import Token, TokenPayload

__all__ = [
    # User
    "User",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserBase",
    "UserInDBBase",
    "UserWithStats",
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
    # Test Result
    "TestResult",
    "TestResultCreate",
    "TestResultUpdate",
    "TestResultInDB",
    "TestResultBase",
    "TestResultInDBBase",
    "TestResultWithDetails",
    "TestStatus",
    # Comment
    "Comment",
    "CommentCreate",
    "CommentUpdate",
    "CommentInDB",
    "CommentBase",
    "CommentInDBBase",
    "CommentWithAuthor",
    # Relationship
    "Relationship",
    "RelationshipCreate",
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
    # Token
    "Token",
    "TokenPayload",
]
