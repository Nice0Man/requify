"""
Role-based permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class RolePermissions:
    """Role-based permission dependencies."""

    @staticmethod
    def read() -> Callable:
        """Dependency for reading role information."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_ROLES, ["view_roles"]
        )

    @staticmethod
    def create() -> Callable:
        """Dependency for creating roles."""
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_ROLE, ["create_role"]
        )

    @staticmethod
    def write() -> Callable:
        """Dependency for updating roles."""
        return PermissionDependencyFactory.create_simple(
            Permission.EDIT_ROLE, ["edit_role"]
        )

    @staticmethod
    def delete() -> Callable:
        """Dependency for deleting roles."""
        return PermissionDependencyFactory.create_simple(
            Permission.DELETE_ROLE, ["delete_role"]
        )

    @staticmethod
    def assign() -> Callable:
        """Dependency for assigning roles."""
        return PermissionDependencyFactory.create_simple(
            Permission.ASSIGN_ROLE, ["assign_role"]
        )


# Export instances
get_roles_read_user = RolePermissions.read()
get_roles_write_user = RolePermissions.write()
get_roles_delete_user = RolePermissions.delete()
get_role_creator_user = RolePermissions.create()
get_role_assigner_user = RolePermissions.assign()
