"""
Admin permission dependencies.

Следует стандартизированному интерфейсу.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class AdminPermissions(StandardPermissionClass):
    """
    Admin permission dependencies.

    Стандартизированные permissions для административных операций
    с дополнительными специфичными методами.
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["Admin"]

    # Специфичные методы для администрирования
    @staticmethod
    def system() -> Callable:
        """Dependency for system administration."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_SYSTEM, ["admin:system"]
        )

    @staticmethod
    def search() -> Callable:
        """Dependency for searching companies."""
        return PermissionDependencyFactory.create_simple(
            Permission.SEARCH_COMPANY, ["admin:search"]
        )

    @staticmethod
    def analytics() -> Callable:
        """Dependency for viewing analytics."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_ANALYTICS, ["admin:analytics"]
        )


# Экспорты для обратной совместимости и современного использования
_exports = AdminPermissions.get_exports()
_legacy_functions = AdminPermissions.get_legacy_functions()

# Backward compatibility
get_admin_read_user = _legacy_functions.get("get_admin_read_user")
get_admin_write_user = _legacy_functions.get("get_admin_write_user")
get_admin_user = AdminPermissions.write()  # Alias
get_dashboard_admin_user = AdminPermissions.analytics()
get_system_manager_user = AdminPermissions.system()

# Modern exports
admin_read_required = _exports.get("adminpermissions_read")
admin_write_required = _exports.get("adminpermissions_write")
admin_admin_required = _exports.get("adminpermissions_admin")

# Специфичные exports
admin_system_required = AdminPermissions.system()
admin_search_required = AdminPermissions.search()
admin_analytics_required = AdminPermissions.analytics()
