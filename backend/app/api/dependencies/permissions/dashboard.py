"""
Dashboard permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class DashboardPermissions:
    """Dashboard permission dependencies."""
    
    @staticmethod
    def read() -> Callable:
        """Dependency for reading dashboard data."""
        return PermissionDependencyFactory.create_simple(
            Permission.USE_API,
            ["me", "use_api"]
        )
    
    @staticmethod
    def analytics() -> Callable:
        """Dependency for viewing dashboard analytics."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_ANALYTICS,
            ["view_company_analytics"]
        )
    
    @staticmethod
    def export() -> Callable:
        """Dependency for exporting dashboard data."""
        return PermissionDependencyFactory.create_simple(
            Permission.EXPORT_REPORTS,
            ["export_reports"]
        )
    
    @staticmethod
    def stats() -> Callable:
        """Dependency for viewing detailed statistics."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_REPORTS,
            ["view_reports"]
        )


# Export instances for backward compatibility
get_dashboard_user = DashboardPermissions.read()
get_stats_read_user = DashboardPermissions.stats()
get_export_user = DashboardPermissions.export()
get_dashboard_analytics_user = DashboardPermissions.analytics()
