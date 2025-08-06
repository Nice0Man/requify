"""
Modular dependency injection system for FastAPI.

Следует принципам SOLID и лучшим практикам архитектуры.
Организованно по доменам для лучшей поддерживаемости.
"""

# Core dependencies
from .core.database import get_db, SessionDep
from .core.auth import (
    get_current_user,
    get_current_active_user,
    get_optional_user,
    get_superuser,
)

# Permission-based dependencies
from .permissions.factory import PermissionDependencyFactory
from .permissions.auth import AuthPermissions
from .permissions.users import UserPermissions
from .permissions.projects import ProjectPermissions
from .permissions.requirements import RequirementPermissions
from .permissions.releases import ReleasePermissions
from .permissions.testing import TestingPermissions
from .permissions.admin import AdminPermissions
from .permissions.dashboard import DashboardPermissions
from .permissions.roles import RolePermissions

# Specialized dependencies
from .specialized.auth0 import get_user_from_auth0_token
from .specialized.validation import ValidationDependencies
from .specialized.analytics import AnalyticsDependencies

# Utility dependencies
from .utils.caching import CachedDependency
from .utils.helpers import (
    get_user_by_id_or_404,
    get_user_by_email_or_404,
    get_user_by_username_or_404,
)

# Aliases for backward compatibility
from .permissions.users import (
    get_users_read_user,
    get_users_write_user,
    get_users_delete_user,
)
from .permissions.admin import (
    get_admin_read_user,
    get_admin_write_user,
    get_admin_user,
    get_dashboard_admin_user,
    get_system_manager_user,
)
from .permissions.dashboard import (
    get_dashboard_user,
    get_stats_read_user,
    get_export_user,
    get_dashboard_analytics_user,
)
from .permissions.requirements import (
    get_requirements_read_user,
    get_requirements_write_user,
    get_requirements_delete_user,
    get_requirement_creator_user,
    get_requirement_approver_user,
)
from .permissions.projects import (
    get_projects_read_user,
    get_projects_write_user,
    get_projects_delete_user,
    get_project_creator_user,
    get_project_archiver_user,
)
from .permissions.releases import (
    get_releases_read_user,
    get_releases_write_user,
    get_releases_delete_user,
    get_release_creator_user,
    get_release_publisher_user,
)
from .permissions.testing import (
    get_testing_read_user,
    get_testing_write_user,
    get_testing_execute_user,
    get_test_plans_manager_user,
)
from .permissions.roles import (
    get_analyst_user,
    get_manager_user,
    get_developer_user,
    get_qa_user,
)

__all__ = [
    # Core
    "get_db",
    "SessionDep",
    "get_current_user",
    "get_current_active_user",
    "get_optional_user",
    "get_superuser",
    # Permission factory
    "PermissionDependencyFactory",
    # Permission domains
    "AuthPermissions",
    "UserPermissions",
    "ProjectPermissions",
    "RequirementPermissions",
    "ReleasePermissions",
    "TestingPermissions",
    "AdminPermissions",
    "DashboardPermissions",
    "RolePermissions",
    # Specialized
    "get_user_from_auth0_token",
    "ValidationDependencies",
    "AnalyticsDependencies",
    # Utils
    "CachedDependency",
    "get_user_by_id_or_404",
    "get_user_by_email_or_404",
    "get_user_by_username_or_404",
    # Backward compatibility
    "get_users_read_user",
    "get_users_write_user",
    "get_users_delete_user",
    "get_admin_read_user",
    "get_admin_write_user",
    "get_admin_user",
    "get_dashboard_admin_user",
    "get_system_manager_user",
    # Dashboard
    "get_dashboard_user",
    "get_stats_read_user",
    "get_export_user",
    "get_dashboard_analytics_user",
    # Requirements
    "get_requirements_read_user",
    "get_requirements_write_user",
    "get_requirements_delete_user",
    "get_requirement_creator_user",
    "get_requirement_approver_user",
    # Projects
    "get_projects_read_user",
    "get_projects_write_user",
    "get_projects_delete_user",
    "get_project_creator_user",
    "get_project_archiver_user",
    # Releases
    "get_releases_read_user",
    "get_releases_write_user",
    "get_releases_delete_user",
    "get_release_creator_user",
    "get_release_publisher_user",
    # Testing
    "get_testing_read_user",
    "get_testing_write_user",
    "get_testing_execute_user",
    "get_test_plans_manager_user",
    # Roles
    "get_analyst_user",
    "get_manager_user",
    "get_developer_user",
    "get_qa_user",
]
