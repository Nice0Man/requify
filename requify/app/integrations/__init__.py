"""
Модуль интеграций с внешними системами.

Содержит все интеграции для взаимодействия с внешними сервисами
и системами в соответствии с принципами SOLID.
"""

from .testing_system import TestingSystemIntegration
from .project_management import ProjectManagementIntegration

__all__ = ["TestingSystemIntegration", "ProjectManagementIntegration"]
