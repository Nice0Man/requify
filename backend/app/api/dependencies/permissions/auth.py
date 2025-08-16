"""
Authentication permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class AuthPermissions:
    """Authentication permission dependencies."""

    @staticmethod
    def basic() -> Callable:
        """Basic authenticated user dependency."""
        return PermissionDependencyFactory.create_simple(
            Permission.USE_API, ["me", "use_api"]
        )

    @staticmethod
    def profile_access() -> Callable:
        """Access to user profile data."""
        return PermissionDependencyFactory.create_simple(Permission.USE_API, ["me"])


# Export instances
get_authenticated_user = AuthPermissions.basic()
get_profile_access_user = AuthPermissions.profile_access()
