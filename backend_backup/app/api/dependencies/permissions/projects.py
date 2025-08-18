"""
Project management permission dependencies.

Специализированные dependencies для управления проектами.
Следует стандартизированному интерфейсу.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class ProjectPermissions(StandardPermissionClass):
    """
    Project management permission dependencies.

    Стандартизированные permissions для управления проектами
    с дополнительными специфичными методами.
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["Project"]

    # Специфичные методы для проектов
    @staticmethod
    def archive() -> Callable:
        """Dependency for archiving projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.ARCHIVE_PROJECT, ["project:archive"]
        )


# Экспорты для обратной совместимости и современного использования
_exports = ProjectPermissions.get_exports()
_legacy_functions = ProjectPermissions.get_legacy_functions()

# Backward compatibility
get_projects_read_user = _legacy_functions.get("get_project_read_user")
get_projects_write_user = _legacy_functions.get("get_project_write_user")
get_projects_delete_user = _legacy_functions.get("get_project_delete_user")
get_project_creator_user = ProjectPermissions.create()
get_project_archiver_user = ProjectPermissions.archive()

# Modern exports
project_read_required = _exports.get("projectpermissions_read")
project_write_required = _exports.get("projectpermissions_write")
project_create_required = _exports.get("projectpermissions_create")
project_delete_required = _exports.get("projectpermissions_delete")
project_admin_required = _exports.get("projectpermissions_admin")

# Специфичные exports
project_archive_required = ProjectPermissions.archive()
