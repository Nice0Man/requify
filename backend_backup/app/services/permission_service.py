"""
Permission Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
Реализует продвинутую систему RBAC с иерархией ролей и контекстными проверками.
"""

from typing import List, Optional, Dict, Any, Set, Tuple, Union
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timedelta
from functools import lru_cache
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_

from app.models.user import User
from app.models.team import Team
from app.models.project import Project
from app.models.company import Company
from app.core.constants import Permission
from app.utils.logger import logger
from .base import BaseService, ServiceError


class PermissionServiceError(ServiceError):
    """Ошибки сервиса разрешений."""

    pass


class AccessDeniedError(PermissionServiceError):
    """Ошибка отказа в доступе."""

    pass


class InvalidContextError(PermissionServiceError):
    """Ошибка некорректного контекста."""

    pass


class RoleScope(str, Enum):
    """Области действия ролей."""

    SYSTEM = "system"
    COMPANY = "company"
    DEPARTMENT = "department"
    TEAM = "team"
    PROJECT = "project"


class PermissionAction(str, Enum):
    """Типы действий для проверки разрешений."""

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    MANAGE = "manage"
    EXECUTE = "execute"
    APPROVE = "approve"
    ASSIGN = "assign"


class ResourceType(str, Enum):
    """Типы ресурсов."""

    USER = "user"
    PROJECT = "project"
    REQUIREMENT = "requirement"
    RELEASE = "release"
    TEAM = "team"
    COMPANY = "company"
    REPORT = "report"
    COMMENT = "comment"
    ACTIVITY = "activity"
    GENERAL = "general"  # Default resource type for generic permissions


@dataclass
class PermissionContext:
    """Контекст для проверки разрешений."""

    user_id: int
    resource_type: ResourceType
    action: PermissionAction
    resource_id: Optional[int] = None
    attributes: Optional[Dict[str, Any]] = None
    company_id: Optional[int] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None


@dataclass
class PermissionResult:
    """Результат проверки разрешений."""

    granted: bool
    reason: str
    scope: Optional[RoleScope] = None
    role_name: Optional[str] = None
    inherited_from: Optional[str] = None
    attributes: List[str] = None


@dataclass
class UserRole:
    """Роль пользователя."""

    role_name: str
    scope: RoleScope
    permissions: List[str]
    resource_id: Optional[int] = None
    company_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None


# Абстрактные интерфейсы
class IPermissionChecker(ABC):
    """Интерфейс проверки разрешений."""

    @abstractmethod
    async def check_permission(
        self, db: AsyncSession, context: PermissionContext
    ) -> PermissionResult:
        """Проверить разрешение."""
        pass


class IRoleResolver(ABC):
    """Интерфейс разрешения ролей."""

    @abstractmethod
    async def get_user_roles(
        self,
        db: AsyncSession,
        user_id: int,
        context: Optional[PermissionContext] = None,
    ) -> List[UserRole]:
        """Получить роли пользователя."""
        pass


class IPermissionCache(ABC):
    """Интерфейс кэша разрешений."""

    @abstractmethod
    def get_cached_permission(
        self,
        user_id: int,
        resource_type: str,
        action: str,
        resource_id: Optional[int] = None,
    ) -> Optional[PermissionResult]:
        """Получить закэшированное разрешение."""
        pass

    @abstractmethod
    def cache_permission(
        self,
        user_id: int,
        resource_type: str,
        action: str,
        result: PermissionResult,
        resource_id: Optional[int] = None,
        ttl: Optional[timedelta] = None,
    ):
        """Закэшировать разрешение."""
        pass


class IAuditLogger(ABC):
    """Интерфейс аудита разрешений."""

    @abstractmethod
    async def log_permission_check(
        self, context: PermissionContext, result: PermissionResult
    ):
        """Логировать проверку разрешения."""
        pass


# Конкретные реализации
class InMemoryPermissionCache(IPermissionCache):
    """Кэш разрешений в памяти."""

    def __init__(self, default_ttl: timedelta = timedelta(minutes=15)):
        self._cache: Dict[str, Tuple[PermissionResult, datetime]] = {}
        self._default_ttl = default_ttl

    def _make_key(
        self,
        user_id: int,
        resource_type: str,
        action: str,
        resource_id: Optional[int] = None,
    ) -> str:
        """Создать ключ для кэша."""
        return f"{user_id}:{resource_type}:{action}:{resource_id or ''}"

    def get_cached_permission(
        self,
        user_id: int,
        resource_type: str,
        action: str,
        resource_id: Optional[int] = None,
    ) -> Optional[PermissionResult]:
        """Получить закэшированное разрешение."""
        key = self._make_key(user_id, resource_type, action, resource_id)

        if key in self._cache:
            result, expires_at = self._cache[key]
            if datetime.utcnow() < expires_at:
                return result
            else:
                # Удаляем устаревшую запись
                del self._cache[key]

        return None

    def cache_permission(
        self,
        user_id: int,
        resource_type: str,
        action: str,
        result: PermissionResult,
        resource_id: Optional[int] = None,
        ttl: Optional[timedelta] = None,
    ):
        """Закэшировать разрешение."""
        key = self._make_key(user_id, resource_type, action, resource_id)
        expires_at = datetime.utcnow() + (ttl or self._default_ttl)
        self._cache[key] = (result, expires_at)

    def clear_user_cache(self, user_id: int):
        """Очистить кэш для пользователя."""
        keys_to_remove = [
            key for key in self._cache.keys() if key.startswith(f"{user_id}:")
        ]
        for key in keys_to_remove:
            del self._cache[key]


class DatabaseRoleResolver(IRoleResolver):
    """Разрешение ролей через базу данных."""

    async def get_user_roles(
        self,
        db: AsyncSession,
        user_id: int,
        context: Optional[PermissionContext] = None,
    ) -> List[UserRole]:
        """Получить роли пользователя."""
        # Простая реализация - получение ролей из User модели
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return []

        roles = []

        # Базовая роль пользователя - check for admin role
        if (
            hasattr(user, "role")
            and user.role
            and user.role.name in ["admin", "system_admin"]
        ):
            roles.append(
                UserRole(
                    role_name="superuser",
                    scope=RoleScope.SYSTEM,
                    permissions=["*"],  # Все разрешения
                )
            )
        elif user.is_active:
            roles.append(
                UserRole(
                    role_name="user",
                    scope=RoleScope.SYSTEM,
                    permissions=["read", "create", "update"],
                )
            )

        # TODO: Добавить логику получения ролей из команд, проектов и т.д.
        # Здесь должна быть интеграция с моделями ролей

        return roles


class HierarchicalPermissionChecker(IPermissionChecker):
    """Проверка разрешений с учетом иерархии."""

    def __init__(self, role_resolver: IRoleResolver):
        self._role_resolver = role_resolver
        self._hierarchy_weights = {
            RoleScope.SYSTEM: 100,
            RoleScope.COMPANY: 80,
            RoleScope.DEPARTMENT: 60,
            RoleScope.TEAM: 40,
            RoleScope.PROJECT: 20,
        }

    async def check_permission(
        self, db: AsyncSession, context: PermissionContext
    ) -> PermissionResult:
        """Проверить разрешение."""
        try:
            # Получение ролей пользователя
            user_roles = await self._role_resolver.get_user_roles(
                db, context.user_id, context
            )

            if not user_roles:
                return PermissionResult(granted=False, reason="No roles found for user")

            # Проверка разрешений по иерархии
            best_match = None
            highest_weight = -1

            for role in user_roles:
                if self._role_grants_permission(role, context):
                    weight = self._hierarchy_weights.get(role.scope, 0)
                    if weight > highest_weight:
                        highest_weight = weight
                        best_match = role

            if best_match:
                return PermissionResult(
                    granted=True,
                    reason=f"Permission granted through role '{best_match.role_name}'",
                    scope=best_match.scope,
                    role_name=best_match.role_name,
                )
            else:
                return PermissionResult(
                    granted=False, reason="No matching permissions found"
                )

        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            return PermissionResult(
                granted=False, reason=f"Error during permission check: {str(e)}"
            )

    def _role_grants_permission(
        self, role: UserRole, context: PermissionContext
    ) -> bool:
        """Проверить, предоставляет ли роль необходимое разрешение."""
        # Суперадмин имеет все права
        if "*" in role.permissions:
            return True

        # Проверка конкретных разрешений
        required_permission = f"{context.resource_type.value}:{context.action.value}"
        generic_permission = f"{context.resource_type.value}:*"
        action_permission = f"*:{context.action.value}"

        return any(
            perm in role.permissions
            for perm in [
                required_permission,
                generic_permission,
                action_permission,
                context.action.value,  # Простое действие
            ]
        )


class StandardAuditLogger(IAuditLogger):
    """Стандартный аудит логгер."""

    async def log_permission_check(
        self, context: PermissionContext, result: PermissionResult
    ):
        """Логировать проверку разрешения."""
        log_data = {
            "user_id": context.user_id,
            "resource_type": context.resource_type.value,
            "action": context.action.value,
            "resource_id": context.resource_id,
            "granted": result.granted,
            "reason": result.reason,
            "role_name": result.role_name,
        }

        if result.granted:
            logger.info(f"Permission granted: {log_data}")
        else:
            logger.warning(f"Permission denied: {log_data}")


class PermissionService(BaseService):
    """
    Основной сервис разрешений.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные проверки разрешений)
    - Chain of Responsibility (иерархия ролей)
    - Template Method (алгоритм проверки)
    - Cache (кэширование результатов)
    """

    def __init__(self):
        self._role_resolver: IRoleResolver = DatabaseRoleResolver()
        self._permission_checker: IPermissionChecker = HierarchicalPermissionChecker(
            self._role_resolver
        )
        self._cache: IPermissionCache = InMemoryPermissionCache()
        self._audit_logger: IAuditLogger = StandardAuditLogger()
        super().__init__()

    def get_service_name(self) -> str:
        return "PermissionService"

    def set_role_resolver(self, resolver: IRoleResolver):
        """Установить разрешитель ролей."""
        self._role_resolver = resolver
        self._permission_checker = HierarchicalPermissionChecker(resolver)
        self._log_operation("set_role_resolver", {"resolver": type(resolver).__name__})

    def set_permission_checker(self, checker: IPermissionChecker):
        """Установить проверщик разрешений."""
        self._permission_checker = checker
        self._log_operation(
            "set_permission_checker", {"checker": type(checker).__name__}
        )

    def set_cache(self, cache: IPermissionCache):
        """Установить кэш разрешений."""
        self._cache = cache
        self._log_operation("set_cache", {"cache": type(cache).__name__})

    async def check_permission(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        action: PermissionAction,
        resource_id: Optional[int] = None,
        **kwargs,
    ) -> bool:
        """Проверить разрешение (упрощенный интерфейс)."""
        try:
            context = PermissionContext(
                user_id=user_id,
                resource_type=resource_type,
                action=action,
                resource_id=resource_id,
                **kwargs,
            )

            result = await self.check_permission_detailed(db, context)
            return result.granted

        except Exception as e:
            raise self._handle_error(e, "check_permission")

    async def check_permission_detailed(
        self, db: AsyncSession, context: PermissionContext
    ) -> PermissionResult:
        """Детальная проверка разрешения."""
        try:
            self._log_operation(
                "check_permission_detailed",
                {
                    "user_id": context.user_id,
                    "resource_type": context.resource_type.value,
                    "action": context.action.value,
                    "resource_id": context.resource_id,
                },
            )

            # Проверка кэша
            cached_result = self._cache.get_cached_permission(
                context.user_id,
                context.resource_type.value,
                context.action.value,
                context.resource_id,
            )

            if cached_result:
                await self._audit_logger.log_permission_check(context, cached_result)
                return cached_result

            # Выполнение проверки
            result = await self._permission_checker.check_permission(db, context)

            # Кэширование результата
            self._cache.cache_permission(
                context.user_id,
                context.resource_type.value,
                context.action.value,
                result,
                context.resource_id,
            )

            # Аудит
            await self._audit_logger.log_permission_check(context, result)

            return result

        except Exception as e:
            raise self._handle_error(e, "check_permission_detailed")

    async def get_user_permissions(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: Optional[ResourceType] = None,
    ) -> List[str]:
        """Получить список разрешений пользователя."""
        try:
            self._log_operation(
                "get_user_permissions",
                {
                    "user_id": user_id,
                    "resource_type": resource_type.value if resource_type else None,
                },
            )

            # Получение ролей пользователя
            user_roles = await self._role_resolver.get_user_roles(db, user_id)

            permissions = set()
            for role in user_roles:
                if resource_type:
                    # Фильтрация по типу ресурса
                    filtered_perms = [
                        perm
                        for perm in role.permissions
                        if perm.startswith(resource_type.value)
                        or perm.startswith("*")
                        or ":" not in perm
                    ]
                    permissions.update(filtered_perms)
                else:
                    permissions.update(role.permissions)

            return list(permissions)

        except Exception as e:
            raise self._handle_error(e, "get_user_permissions")

    async def can_user_access_resource(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        resource_id: int,
        action: PermissionAction = PermissionAction.READ,
    ) -> bool:
        """Проверить доступ пользователя к ресурсу."""
        try:
            return await self.check_permission(
                db, user_id, resource_type, action, resource_id
            )

        except Exception as e:
            raise self._handle_error(e, "can_user_access_resource")

    async def require_permission(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        action: PermissionAction,
        resource_id: Optional[int] = None,
        error_message: Optional[str] = None,
    ):
        """Требовать разрешение (выбросить исключение если нет доступа)."""
        try:
            has_permission = await self.check_permission(
                db, user_id, resource_type, action, resource_id
            )

            if not has_permission:
                message = (
                    error_message
                    or f"Access denied for {action.value} on {resource_type.value}"
                )
                raise AccessDeniedError(message)

        except AccessDeniedError:
            raise
        except Exception as e:
            raise self._handle_error(e, "require_permission")

    def clear_user_cache(self, user_id: int):
        """Очистить кэш разрешений для пользователя."""
        try:
            self._log_operation("clear_user_cache", {"user_id": user_id})
            self._cache.clear_user_cache(user_id)

        except Exception as e:
            raise self._handle_error(e, "clear_user_cache")

    # Convenience методы для быстрых проверок
    async def can_create(
        self, db: AsyncSession, user_id: int, resource_type: ResourceType, **kwargs
    ) -> bool:
        """Может ли пользователь создавать ресурс."""
        return await self.check_permission(
            db, user_id, resource_type, PermissionAction.CREATE, **kwargs
        )

    async def can_read(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        resource_id: int,
        **kwargs,
    ) -> bool:
        """Может ли пользователь читать ресурс."""
        return await self.check_permission(
            db, user_id, resource_type, PermissionAction.READ, resource_id, **kwargs
        )

    async def can_update(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        resource_id: int,
        **kwargs,
    ) -> bool:
        """Может ли пользователь обновлять ресурс."""
        return await self.check_permission(
            db, user_id, resource_type, PermissionAction.UPDATE, resource_id, **kwargs
        )

    async def can_delete(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        resource_id: int,
        **kwargs,
    ) -> bool:
        """Может ли пользователь удалять ресурс."""
        return await self.check_permission(
            db, user_id, resource_type, PermissionAction.DELETE, resource_id, **kwargs
        )

    async def can_manage(
        self,
        db: AsyncSession,
        user_id: int,
        resource_type: ResourceType,
        resource_id: Optional[int] = None,
        **kwargs,
    ) -> bool:
        """Может ли пользователь управлять ресурсом."""
        return await self.check_permission(
            db, user_id, resource_type, PermissionAction.MANAGE, resource_id, **kwargs
        )


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("permission", PermissionService)

# Singleton instance
permission_service = PermissionService()
