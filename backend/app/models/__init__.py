"""
SQLAlchemy модели.
"""

from .comment import Comment

# Dashboard models
from .dashboard import (
    DashboardActivity,
    DashboardNotification,
    DashboardWidget,
    UserDashboardPreferences,
)
from .project import Project
from .refresh_token import RefreshToken
from .relationship import Relationship
from .relationship_types import RelationshipType
from .release import Release
from .requirement import Requirement
from .requirement_group import RequirementGroup
from .requirement_group_version import RequirementGroupVersion
from .requirement_priorities import RequirementPriority

# Импортируем энумы
from .requirement_statuses import RequirementStatus
from .requirement_types import RequirementType
from .spec import Spec

# Team models
from .team import Team
from .team_member import TeamMember
from .test_result import TestResult

# Импортируем все модели для Alembic автогенерации миграций
from .user import User

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
