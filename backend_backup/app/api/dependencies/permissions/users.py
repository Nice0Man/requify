"""
User management permission dependencies.

Специализированные dependencies для управления пользователями.
Следует доменно-ориентированному подходу (DDD).
"""

from typing import Callable, Dict, Any
from fastapi import Security

from app.core.constants import Permission
from app.models.user import User
from ..core.auth import get_current_user
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class UserPermissions(StandardPermissionClass):
    """
    User management permission dependencies.

    Организованы по принципу Domain-Driven Design:
    - Логически сгруппированы по домену пользователей
    - Инкапсулируют бизнес-правила домена
    - Следуют стандартизированному интерфейсу
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["User"]

    # Специальные методы для пользователей
    @staticmethod
    def invite() -> Callable:
        """Dependency for inviting new users."""
        return PermissionDependencyFactory.create_simple(
            Permission.INVITE_USERS, ["user:invite"]
        )

    @staticmethod
    def profile_access() -> Callable:
        """Dependency for accessing user profiles."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_COMPANY_USERS, ["user:profile"]
        )


# Backward compatibility functions (стандартизированные)
_legacy_functions = UserPermissions.get_legacy_functions()

get_users_read_user = _legacy_functions.get("get_user_read_user")
get_users_write_user = _legacy_functions.get("get_user_write_user")
get_users_delete_user = _legacy_functions.get("get_user_delete_user")

# Modern dependency exports (стандартизированные)
_exports = UserPermissions.get_exports()

user_read_required = _exports.get("userpermissions_read")
user_write_required = _exports.get("userpermissions_write")
user_create_required = _exports.get("userpermissions_create")
user_update_required = _exports.get("userpermissions_update")
user_delete_required = _exports.get("userpermissions_delete")
user_admin_required = _exports.get("userpermissions_admin")

# Специфичные для домена exports
user_invite_required = UserPermissions.invite()
user_profile_access_required = UserPermissions.profile_access()
