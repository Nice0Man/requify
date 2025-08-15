"""
Стандартизированный интерфейс для permission dependencies.

Определяет единый контракт для всех permission классов в системе.
"""

from typing import Protocol, Callable, List, Dict, Any, Optional
from app.core.constants import Permission


class PermissionInterface(Protocol):
    """
    Protocol для всех permission классов.

    Определяет минимальный набор методов, которые должны быть
    реализованы в каждом permission классе.
    """

    @staticmethod
    def read() -> Callable:
        """Dependency для чтения данных."""
        ...

    @staticmethod
    def write() -> Callable:
        """Dependency для записи данных."""
        ...


class ExtendedPermissionInterface(PermissionInterface, Protocol):
    """
    Расширенный интерфейс для permission классов.

    Включает дополнительные стандартные методы для полнофункциональных
    permission классов.
    """

    @staticmethod
    def create() -> Callable:
        """Dependency для создания сущностей."""
        ...

    @staticmethod
    def update() -> Callable:
        """Dependency для обновления сущностей."""
        ...

    @staticmethod
    def delete() -> Callable:
        """Dependency для удаления сущностей."""
        ...

    @staticmethod
    def admin() -> Callable:
        """Dependency для административных операций."""
        ...


class PermissionConfig:
    """
    Конфигурация для permission класса.

    Стандартизирует настройки и метаданные для каждого домена.
    """

    def __init__(
        self,
        domain_name: str,
        base_permission: Permission,
        scopes_prefix: str,
        description: str = "",
        special_permissions: Optional[Dict[str, Permission]] = None,
    ):
        self.domain_name = domain_name
        self.base_permission = base_permission
        self.scopes_prefix = scopes_prefix
        self.description = description
        self.special_permissions = special_permissions or {}

    def get_scope(self, operation: str) -> str:
        """Получить OAuth2 scope для операции."""
        return f"{self.scopes_prefix}:{operation}"

    def get_permission(self, operation: str) -> Permission:
        """Получить Permission enum для операции."""
        if operation in self.special_permissions:
            return self.special_permissions[operation]

        # Используем базовое permission для всех операций
        return self.base_permission


# Стандартные конфигурации доменов
DOMAIN_CONFIGS = {
    "User": PermissionConfig(
        domain_name="User",
        base_permission=Permission.VIEW_COMPANY_USERS,
        scopes_prefix="user",
        description="User management operations",
        special_permissions={
            "read": Permission.VIEW_COMPANY_USERS,
            "write": Permission.MANAGE_COMPANY_USERS,
            "create": Permission.MANAGE_COMPANY_USERS,
            "update": Permission.MANAGE_COMPANY_USERS,
            "delete": Permission.REMOVE_USERS,
            "invite": Permission.INVITE_USERS,
        },
    ),
    "Project": PermissionConfig(
        domain_name="Project",
        base_permission=Permission.VIEW_PROJECT,
        scopes_prefix="project",
        description="Project management operations",
        special_permissions={
            "read": Permission.VIEW_PROJECT,
            "write": Permission.MANAGE_PROJECT,
            "create": Permission.CREATE_PROJECT,
            "delete": Permission.DELETE_PROJECT,
        },
    ),
    "Requirement": PermissionConfig(
        domain_name="Requirement",
        base_permission=Permission.VIEW_REQUIREMENT,
        scopes_prefix="requirement",
        description="Requirements management operations",
        special_permissions={
            "read": Permission.VIEW_REQUIREMENT,
            "write": Permission.EDIT_REQUIREMENT,
            "create": Permission.CREATE_REQUIREMENT,
            "delete": Permission.DELETE_REQUIREMENT,
            "approve": Permission.APPROVE_REQUIREMENT,
        },
    ),
    "Release": PermissionConfig(
        domain_name="Release",
        base_permission=Permission.VIEW_RELEASE,
        scopes_prefix="release",
        description="Release management operations",
        special_permissions={
            "read": Permission.VIEW_RELEASE,
            "write": Permission.MANAGE_RELEASE,
            "create": Permission.CREATE_RELEASE,
            "delete": Permission.DELETE_RELEASE,
            "publish": Permission.PUBLISH_RELEASE,
        },
    ),
    "Testing": PermissionConfig(
        domain_name="Testing",
        base_permission=Permission.VIEW_TEST_RESULTS,
        scopes_prefix="test",
        description="Testing operations",
        special_permissions={
            "read": Permission.VIEW_TEST_RESULTS,
            "write": Permission.CREATE_TEST,
            "create": Permission.CREATE_TEST,
            "execute": Permission.EXECUTE_TEST,
            "manage_plans": Permission.MANAGE_TEST_PLANS,
        },
    ),
    "Admin": PermissionConfig(
        domain_name="Admin",
        base_permission=Permission.VIEW_COMPANY_SETTINGS,
        scopes_prefix="admin",
        description="Administrative operations",
        special_permissions={
            "read": Permission.VIEW_COMPANY_SETTINGS,
            "write": Permission.MANAGE_COMPANY,
            "system": Permission.MANAGE_SYSTEM,
            "analytics": Permission.VIEW_COMPANY_ANALYTICS,
        },
    ),
    "Company": PermissionConfig(
        domain_name="Company",
        base_permission=Permission.VIEW_PROJECT,
        scopes_prefix="company",
        description="Company management operations",
        special_permissions={
            "read": Permission.VIEW_PROJECT,
            "write": Permission.MANAGE_PROJECT,
            "settings": Permission.MANAGE_COMPANY_SETTINGS,
            "subscription": Permission.MANAGE_COMPANY,
            "admin": Permission.MANAGE_COMPANY,
        },
    ),
    "Team": PermissionConfig(
        domain_name="Team",
        base_permission=Permission.VIEW_PROJECT,
        scopes_prefix="team",
        description="Team management operations",
        special_permissions={
            "read": Permission.VIEW_PROJECT,
            "write": Permission.MANAGE_PROJECT,
            "create": Permission.CREATE_PROJECT,
            "delete": Permission.DELETE_PROJECT,
            "manage_members": Permission.MANAGE_TEAM,
            "lead": Permission.MANAGE_TEAM,
        },
    ),
}


def get_domain_config(domain_name: str) -> PermissionConfig:
    """Получить конфигурацию домена."""
    return DOMAIN_CONFIGS.get(
        domain_name,
        PermissionConfig(
            domain_name=domain_name,
            base_permission=Permission.USE_API,
            scopes_prefix=domain_name.lower(),
            description=f"{domain_name} operations",
        ),
    )
