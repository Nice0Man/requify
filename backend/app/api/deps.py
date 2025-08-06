"""
Legacy dependencies module for backward compatibility.

DEPRECATED: This module is maintained for backward compatibility only.
New code should use the modular dependency system in app.api.dependencies.

Migrated to modular architecture following SOLID principles:
- app.api.dependencies.core.* - Core dependencies (auth, database)
- app.api.dependencies.permissions.* - Permission-based dependencies by domain  
- app.api.dependencies.specialized.* - Specialized dependencies (Auth0, validation)
- app.api.dependencies.utils.* - Utility dependencies (caching, helpers)
"""

# Import from new modular system for backward compatibility
from app.api.dependencies import *

# Legacy warning for deprecated usage
import warnings

def _warn_deprecated():
    warnings.warn(
        "app.api.deps is deprecated. Use app.api.dependencies instead.",
        DeprecationWarning,
        stacklevel=3
    )

# Only show warning once per session
_warned = False

def __getattr__(name):
    global _warned
    if not _warned:
        _warn_deprecated()
        _warned = True
    
    # Try to get from new dependency system
    from app.api import dependencies
    if hasattr(dependencies, name):
        return getattr(dependencies, name)
    
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


# Backward compatibility - re-export commonly used dependencies
__all__ = [
    # Core
    "get_db",
    "get_current_user", 
    "get_current_active_user",
    "get_optional_user",
    "get_superuser",
    # Permissions
    "get_users_read_user",
    "get_users_write_user", 
    "get_users_delete_user",
    "get_projects_read_user",
    "get_projects_write_user",
    "get_projects_delete_user", 
    "get_requirements_read_user",
    "get_requirements_write_user",
    "get_requirements_delete_user",
    "get_releases_read_user", 
    "get_releases_write_user",
    "get_releases_delete_user",
    "get_testing_read_user",
    "get_testing_write_user",
    "get_testing_execute_user",
    "get_admin_read_user",
    "get_admin_write_user",
    "get_admin_user",
    "get_dashboard_admin_user",
    # Utils
    "get_user_by_id_or_404",
    "get_user_by_email_or_404",
    "get_user_by_username_or_404",
    # Specialized
    "get_user_from_auth0_token",
]
