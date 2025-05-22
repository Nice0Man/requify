"""
Импорты моделей для Alembic.
"""

# Импорт всех моделей для автоматического обнаружения Alembic
from app.db.base import Base  # noqa
from app.models.user import User  # noqa
from app.models.project import Project  # noqa
from app.models.requirement import Requirement  # noqa
from app.models.release import Release  # noqa
from app.models.test_result import TestResult  # noqa
