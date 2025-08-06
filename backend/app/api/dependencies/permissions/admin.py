"""
Admin permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class AdminPermissions:
    """Admin permission dependencies."""
    
    @staticmethod
    def read() -> Callable:
        """Dependency for reading admin data."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_SETTINGS,
            ["view_company_settings"]
        )
    
    @staticmethod
    def write() -> Callable:
        """Dependency for admin write operations."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_COMPANY,
            ["manage_company"]
        )
    
    @staticmethod
    def system() -> Callable:
        """Dependency for system administration."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_SYSTEM,
            ["manage_system"]
        )
    
    @staticmethod
    def analytics() -> Callable:
        """Dependency for viewing analytics."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_ANALYTICS,
            ["view_company_analytics"]
        )


# Export instances
get_admin_read_user = AdminPermissions.read()
get_admin_write_user = AdminPermissions.write()
get_admin_user = AdminPermissions.write()  # Alias
get_dashboard_admin_user = AdminPermissions.analytics()
get_system_manager_user = AdminPermissions.system()
