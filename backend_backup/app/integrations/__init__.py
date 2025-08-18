"""
Модуль интеграций с внешними системами.

Содержит все интеграции для взаимодействия с внешними сервисами
и системами в соответствии с принципами SOLID.
"""

from .project_management import ProjectManagementIntegration
from .testing_system import TestingSystemIntegration

__all__ = ["TestingSystemIntegration", "ProjectManagementIntegration"]
