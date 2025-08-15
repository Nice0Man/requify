"""
Release management permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory


class ReleasePermissions:
    """Release management permission dependencies."""

    @staticmethod
    def read() -> Callable:
        """Dependency for reading releases."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_RELEASE, ["view_release"]
        )

    @staticmethod
    def create() -> Callable:
        """Dependency for creating releases."""
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_RELEASE, ["create_release"]
        )

    @staticmethod
    def write() -> Callable:
        """Dependency for updating releases."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_RELEASE, ["manage_release"]
        )

    @staticmethod
    def delete() -> Callable:
        """Dependency for deleting releases."""
        return PermissionDependencyFactory.create_simple(
            Permission.DELETE_RELEASE, ["delete_release"]
        )

    @staticmethod
    def publish() -> Callable:
        """Dependency for publishing releases."""
        return PermissionDependencyFactory.create_simple(
            Permission.PUBLISH_RELEASE, ["publish_release"]
        )


# Export instances
get_releases_read_user = ReleasePermissions.read()
get_releases_write_user = ReleasePermissions.write()
get_releases_delete_user = ReleasePermissions.delete()
get_release_creator_user = ReleasePermissions.create()
get_release_publisher_user = ReleasePermissions.publish()
