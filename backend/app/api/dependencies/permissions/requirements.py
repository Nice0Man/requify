"""
Requirements management permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class RequirementPermissions:
    """Requirements management permission dependencies."""
    
    @staticmethod
    def read() -> Callable:
        """Dependency for reading requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_REQUIREMENT,
            ["view_requirement"]
        )
    
    @staticmethod
    def create() -> Callable:
        """Dependency for creating requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_REQUIREMENT,
            ["create_requirement"]
        )
    
    @staticmethod
    def write() -> Callable:
        """Dependency for updating requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.EDIT_REQUIREMENT,
            ["edit_requirement"]
        )
    
    @staticmethod
    def delete() -> Callable:
        """Dependency for deleting requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.DELETE_REQUIREMENT,
            ["delete_requirement"]
        )
    
    @staticmethod
    def approve() -> Callable:
        """Dependency for approving requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.APPROVE_REQUIREMENT,
            ["approve_requirement"]
        )


# Export instances
get_requirements_read_user = RequirementPermissions.read()
get_requirements_write_user = RequirementPermissions.write()
get_requirements_delete_user = RequirementPermissions.delete()
get_requirement_creator_user = RequirementPermissions.create()
get_requirement_approver_user = RequirementPermissions.approve()
