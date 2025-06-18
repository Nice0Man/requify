"""
CRUD операции для всех моделей.

Этот модуль содержит базовые и специализированные CRUD операции
для всех моделей приложения, следуя принципам DRY и SOLID.
"""

from .base import CRUDBase
from .user import user
from .refresh_token import crud_refresh_token
from .project import project
from .requirement import requirement
from .release import release
from .comment import comment
from .relationship import relationship
from .relationship_types import relationship_type
from .requirement_group import requirement_group
from .requirement_group_version import requirement_group_version
from .requirement_priorities import requirement_priority
from .requirement_statuses import requirement_status
from .requirement_types import requirement_type
from .spec import spec
from .test_result import test_result

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
]
