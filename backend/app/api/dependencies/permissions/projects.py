"""
Project management permission dependencies.

Специализированные dependencies для управления проектами.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class ProjectPermissions:
    """Project management permission dependencies."""
    
    @staticmethod
    def read() -> Callable:
        """Dependency for reading projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_PROJECT,
            ["view_project"]
        )
    
    @staticmethod
    def create() -> Callable:
        """Dependency for creating projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_PROJECT,
            ["create_project"]
        )
    
    @staticmethod
    def write() -> Callable:
        """Dependency for updating projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_PROJECT,
            ["manage_project"]
        )
    
    @staticmethod
    def delete() -> Callable:
        """Dependency for deleting projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.DELETE_PROJECT,
            ["delete_project"]
        )
    
    @staticmethod
    def archive() -> Callable:
        """Dependency for archiving projects."""
        return PermissionDependencyFactory.create_simple(
            Permission.ARCHIVE_PROJECT,
            ["manage_project"]
        )


# Export instances for direct use
get_projects_read_user = ProjectPermissions.read()
get_projects_write_user = ProjectPermissions.write()
get_projects_delete_user = ProjectPermissions.delete()
get_project_creator_user = ProjectPermissions.create()
get_project_archiver_user = ProjectPermissions.archive()
