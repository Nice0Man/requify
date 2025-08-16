"""
CRUD операции для всех моделей.

Этот модуль содержит базовые и специализированные CRUD операции
для всех моделей приложения, следуя принципам DRY и SOLID.
"""

from .base import CRUDBase
from .comment import comment

# Dashboard CRUD operations
from .dashboard import activity, notification, user_preferences, widget
from .project import project
from .refresh_token import crud_refresh_token
from .relationship import relationship
from .relationship_types import relationship_type
from .release import release
from .requirement import requirement
from .requirement_group import requirement_group
from .requirement_group_version import requirement_group_version
from .requirement_priorities import requirement_priority
from .requirement_statuses import requirement_status
from .requirement_types import requirement_type
from .spec import spec

# Team CRUD operations
from .team import team, team_member
from .test_result import test_result
from .user import user

__all__ = [
    "CRUDBase",
    "user",
    "crud_refresh_token",
    "project",
    "requirement",
    "release",
    "comment",
    "relationship",
    "relationship_type",
    "requirement_group",
    "requirement_group_version",
    "requirement_priority",
    "requirement_status",
    "requirement_type",
    "spec",
    "test_result",
    # Team CRUD
    "team",
    "team_member",
    # Dashboard CRUD
    "user_preferences",
    "notification",
    "activity",
    "widget",
]
