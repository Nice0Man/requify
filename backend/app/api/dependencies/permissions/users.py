"""
User management permission dependencies.

Специализированные dependencies для управления пользователями.
Следует доменно-ориентированному подходу (DDD).
"""

from typing import Callable
from fastapi import Security

from app.core.constants import Permission
from app.models.user import User
from ..core.auth import get_current_user
from .factory import PermissionDependencyFactory


class UserPermissions:
    """
    User management permission dependencies.
    
    Организованы по принципу Domain-Driven Design:
    - Логически сгруппированы по домену пользователей
    - Инкапсулируют бизнес-правила домена
    """
    
    @staticmethod
    def read() -> Callable:
        """Dependency for reading user information."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_USERS,
            ["view_company_users"]
        )
    
    @staticmethod
    def write() -> Callable:
        """Dependency for creating/updating users."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_COMPANY_USERS,
            ["manage_company_users"]
        )
    
    @staticmethod
    def delete() -> Callable:
        """Dependency for deleting users."""
        return PermissionDependencyFactory.create_simple(
            Permission.REMOVE_USERS,
            ["manage_company_users"]
        )
    
    @staticmethod
    def invite() -> Callable:
        """Dependency for inviting new users."""
        return PermissionDependencyFactory.create_simple(
            Permission.INVITE_USERS,
            ["manage_company_users"]
        )
    
    @staticmethod
    def full_access() -> Callable:
        """Dependency for full user management access."""
        return PermissionDependencyFactory.create_combined([
            Permission.VIEW_COMPANY_USERS,
            Permission.MANAGE_COMPANY_USERS,
            Permission.INVITE_USERS,
            Permission.REMOVE_USERS,
        ])


# Backward compatibility aliases
async def get_users_read_user(
    current_user: User = Security(get_current_user, scopes=["view_company_users"])
) -> User:
    """Backward compatibility: User read permission."""
    dependency = UserPermissions.read()
    return await dependency(current_user=current_user)


async def get_users_write_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"])
) -> User:
    """Backward compatibility: User write permission."""
    dependency = UserPermissions.write()
    return await dependency(current_user=current_user)


async def get_users_delete_user(
    current_user: User = Security(get_current_user, scopes=["manage_company_users"])
) -> User:
    """Backward compatibility: User delete permission."""
    dependency = UserPermissions.delete()
    return await dependency(current_user=current_user)


# Modern dependency exports
user_read_required = UserPermissions.read()
user_write_required = UserPermissions.write()
user_delete_required = UserPermissions.delete()
user_invite_required = UserPermissions.invite()
user_full_access_required = UserPermissions.full_access()
