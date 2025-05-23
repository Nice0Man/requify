"""
SQLAlchemy модели.
"""

# Импортируем все модели для Alembic автогенерации миграций
from .user import User
from .project import Project
from .requirement import Requirement
from .requirement_group import RequirementGroup
from .requirement_group_version import RequirementGroupVersion
from .spec import Spec
from .release import Release
from .relationship import Relationship
from .comment import Comment
from .test_result import TestResult

# Импортируем энумы
from .requirement_statuses import RequirementStatus
from .requirement_priorities import RequirementPriority
from .requirement_types import RequirementType
from .relationship_types import RelationshipType

__all__ = [
    "User",
    "Project",
    "Requirement",
    "RequirementGroup",
    "RequirementGroupVersion",
    "Spec",
    "Release",
    "Relationship",
    "Comment",
    "TestResult",
    "RequirementStatus",
    "RequirementPriority",
    "RequirementType",
    "RelationshipType",
]
