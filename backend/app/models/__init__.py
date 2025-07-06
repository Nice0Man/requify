"""
SQLAlchemy модели.
"""

# Импортируем все модели для Alembic автогенерации миграций
from .user import User
from .refresh_token import RefreshToken
from .project import Project
from .requirement import Requirement
from .requirement_group import RequirementGroup
from .requirement_group_version import RequirementGroupVersion
from .spec import Spec
from .release import Release
from .relationship import Relationship
from .comment import Comment
from .test_result import TestResult

# Team models
from .team import Team
from .team_member import TeamMember

# Dashboard models
from .dashboard import (
    UserDashboardPreferences,
    DashboardNotification,
    DashboardActivity,
    DashboardWidget,
)

# Импортируем энумы
from .requirement_statuses import RequirementStatus
from .requirement_priorities import RequirementPriority
from .requirement_types import RequirementType
from .relationship_types import RelationshipType

__all__ = [
    "User",
    "RefreshToken",
    "Project",
    "Requirement",
    "RequirementGroup",
    "RequirementGroupVersion",
    "Spec",
    "Release",
    "Relationship",
    "Comment",
    "TestResult",
    # Team models
    "Team",
    "TeamMember",
    # Dashboard models
    "UserDashboardPreferences",
    "DashboardNotification",
    "DashboardActivity",
    "DashboardWidget",
    # Enums
    "RequirementStatus",
    "RequirementPriority",
    "RequirementType",
    "RelationshipType",
]
