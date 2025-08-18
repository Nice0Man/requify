"""
Team management permission dependencies.

Специализированные dependencies для управления командами.
Следует стандартизированному интерфейсу.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class TeamPermissions(StandardPermissionClass):
    """
    Team management permission dependencies.

    Стандартизированные permissions для управления командами
    с дополнительными специфичными методами.
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["Team"]

    # Специфичные методы для команд
    @staticmethod
    def manage_members() -> Callable:
        """Dependency for managing team members."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_TEAM, ["team:members"]
        )

    @staticmethod
    def lead() -> Callable:
        """Dependency for team leadership operations."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_TEAM, ["team:lead"]
        )


# Экспорты для обратной совместимости и современного использования
_exports = TeamPermissions.get_exports()
_legacy_functions = TeamPermissions.get_legacy_functions()

# Основные exports
team_read_required = _exports.get("teampermissions_read")
team_write_required = _exports.get("teampermissions_write")
team_create_required = _exports.get("teampermissions_create")
team_delete_required = _exports.get("teampermissions_delete")
team_admin_required = _exports.get("teampermissions_admin")

# Специфичные exports
team_manage_members_required = TeamPermissions.manage_members()
team_lead_required = TeamPermissions.lead()
