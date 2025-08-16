"""
Role Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Set, Tuple
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_, update, delete, func

from app.models.user import User
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.team import Team
from app.models.project import Project
from app.core.constants import (
    Permission,
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)
from app.crud.enhanced_role import enhanced_role, user_role_assignment
from app.crud.role_hierarchy import role_hierarchy
from app.utils.logger import logger
from .base import BaseService, ServiceError
from .role_hierarchy_service import role_hierarchy_service


class RoleServiceError(ServiceError):
    """Ошибки сервиса ролей."""

    pass


class RoleNotFoundError(RoleServiceError):
    """Ошибка - роль не найдена."""

    pass


class RoleConflictError(RoleServiceError):
    """Ошибка конфликта ролей."""

    pass


class InsufficientPermissionsError(RoleServiceError):
    """Ошибка недостаточных прав."""

    pass


class RoleOperationType(str, Enum):
    """Типы операций с ролями."""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    ASSIGN = "assign"
    REVOKE = "revoke"


class RoleLevel(str, Enum):
    """Уровни ролей."""

    SYSTEM = "system"
    COMPANY = "company"
    DEPARTMENT = "department"
    TEAM = "team"
    PROJECT = "project"


@dataclass
class RoleInfo:
    """Информация о роли."""

    id: int
    name: str
    display_name: str
    scope: RoleScope
    permissions: List[str]
    description: Optional[str] = None
    level: int = 0
    is_template: bool = False
    is_active: bool = True


@dataclass
class RoleAssignment:
    """Назначение роли."""

    user_id: int
    role_id: int
    scope: RoleScope
    context_id: Optional[int] = None
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[int] = None
    expires_at: Optional[datetime] = None


# Абстрактные интерфейсы
class IRoleRepository(ABC):
    """Интерфейс репозитория ролей."""

    @abstractmethod
    async def get_role_by_id(
        self, db: AsyncSession, role_id: int
    ) -> Optional[EnhancedRole]:
        """Получить роль по ID."""
        pass

    @abstractmethod
    async def create_role(
        self, db: AsyncSession, role_data: Dict[str, Any]
    ) -> EnhancedRole:
        """Создать роль."""
        pass

    @abstractmethod
    async def update_role(
        self, db: AsyncSession, role_id: int, updates: Dict[str, Any]
    ) -> EnhancedRole:
        """Обновить роль."""
        pass


class IRoleValidator(ABC):
    """Интерфейс валидатора ролей."""

    @abstractmethod
    async def validate_role_creation(
        self, db: AsyncSession, role_data: Dict[str, Any]
    ) -> bool:
        """Валидировать создание роли."""
        pass

    @abstractmethod
    async def validate_role_assignment(
        self,
        db: AsyncSession,
        user: User,
        role: EnhancedRole,
        context_id: Optional[int] = None,
    ) -> bool:
        """Валидировать назначение роли."""
        pass


class IRoleHierarchyManager(ABC):
    """Интерфейс менеджера иерархии ролей."""

    @abstractmethod
    async def get_inherited_permissions(
        self, db: AsyncSession, user: User, context_id: Optional[int] = None
    ) -> Set[str]:
        """Получить унаследованные разрешения."""
        pass


# Конкретные реализации
class DatabaseRoleRepository(IRoleRepository):
    """Репозиторий ролей в базе данных."""

    async def get_role_by_id(
        self, db: AsyncSession, role_id: int
    ) -> Optional[EnhancedRole]:
        """Получить роль по ID."""
        return await enhanced_role.get(db, id=role_id)

    async def create_role(
        self, db: AsyncSession, role_data: Dict[str, Any]
    ) -> EnhancedRole:
        """Создать роль."""
        return await enhanced_role.create(db, obj_in=role_data)

    async def update_role(
        self, db: AsyncSession, role_id: int, updates: Dict[str, Any]
    ) -> EnhancedRole:
        """Обновить роль."""
        role = await self.get_role_by_id(db, role_id)
        if not role:
            raise RoleNotFoundError(f"Role with ID {role_id} not found")

        return await enhanced_role.update(db, db_obj=role, obj_in=updates)

    async def get_roles_by_scope(
        self, db: AsyncSession, scope: RoleScope, skip: int = 0, limit: int = 100
    ) -> List[EnhancedRole]:
        """Получить роли по области действия."""
        return await enhanced_role.get_by_scope(db, scope=scope, skip=skip, limit=limit)

    async def search_roles(
        self, db: AsyncSession, query: str, scope: Optional[RoleScope] = None
    ) -> List[EnhancedRole]:
        """Поиск ролей по запросу."""
        stmt = select(EnhancedRole).where(
            or_(
                EnhancedRole.name.ilike(f"%{query}%"),
                EnhancedRole.display_name.ilike(f"%{query}%"),
                EnhancedRole.description.ilike(f"%{query}%"),
            )
        )

        if scope:
            stmt = stmt.where(EnhancedRole.scope == scope)

        result = await db.execute(stmt)
        return result.scalars().all()


class StandardRoleValidator(IRoleValidator):
    """Стандартный валидатор ролей."""

    async def validate_role_creation(
        self, db: AsyncSession, role_data: Dict[str, Any]
    ) -> bool:
        """Валидировать создание роли."""
        # Проверка уникальности имени роли в рамках области
        name = role_data.get("name")
        scope = role_data.get("scope")

        if not name or not scope:
            raise RoleServiceError("Role name and scope are required")

        existing_role = await self._check_role_name_exists(db, name, scope)
        if existing_role:
            raise RoleConflictError(
                f"Role with name '{name}' already exists in scope '{scope}'"
            )

        # Валидация разрешений
        permissions = role_data.get("permissions", [])
        if not self._validate_permissions(permissions):
            raise RoleServiceError("Invalid permissions specified")

        return True

    async def validate_role_assignment(
        self,
        db: AsyncSession,
        user: User,
        role: EnhancedRole,
        context_id: Optional[int] = None,
    ) -> bool:
        """Валидировать назначение роли."""
        # Проверка активности пользователя
        if not user.is_active:
            raise RoleServiceError("Cannot assign role to inactive user")

        # Проверка активности роли
        if not role.is_active:
            raise RoleServiceError("Cannot assign inactive role")

        # Проверка существующих назначений
        existing_assignment = await self._check_existing_assignment(
            db, user.id, role.id, context_id
        )
        if existing_assignment:
            raise RoleConflictError("Role already assigned to user in this context")

        return True

    async def _check_role_name_exists(
        self, db: AsyncSession, name: str, scope: RoleScope
    ) -> Optional[EnhancedRole]:
        """Проверить существование роли с таким именем."""
        stmt = select(EnhancedRole).where(
            and_(EnhancedRole.name == name, EnhancedRole.scope == scope)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def _check_existing_assignment(
        self, db: AsyncSession, user_id: int, role_id: int, context_id: Optional[int]
    ) -> Optional[UserRoleAssignment]:
        """Проверить существующее назначение роли."""
        stmt = select(UserRoleAssignment).where(
            and_(
                UserRoleAssignment.user_id == user_id,
                UserRoleAssignment.role_id == role_id,
                UserRoleAssignment.context_id == context_id,
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    def _validate_permissions(self, permissions: List[str]) -> bool:
        """Валидировать список разрешений."""
        try:
            # Проверка, что все разрешения валидны
            valid_permissions = {perm.value for perm in Permission}
            for permission in permissions:
                if permission not in valid_permissions:
                    return False
            return True
        except Exception:
            return False


class RoleHierarchyManager(IRoleHierarchyManager):
    """Менеджер иерархии ролей."""

    async def get_inherited_permissions(
        self, db: AsyncSession, user: User, context_id: Optional[int] = None
    ) -> Set[str]:
        """Получить все унаследованные разрешения пользователя."""
        permissions = set()

        # Получение прямых назначений ролей
        direct_roles = await self._get_user_roles(db, user.id, context_id)
        for role in direct_roles:
            permissions.update(role.get_permissions())

        # Получение унаследованных ролей через команды
        inherited_roles = await self._get_inherited_roles(db, user.id, context_id)
        for role in inherited_roles:
            permissions.update(role.get_permissions())

        return permissions

    async def _get_user_roles(
        self, db: AsyncSession, user_id: int, context_id: Optional[int] = None
    ) -> List[EnhancedRole]:
        """Получить прямые роли пользователя."""
        stmt = (
            select(EnhancedRole)
            .join(UserRoleAssignment)
            .where(UserRoleAssignment.user_id == user_id)
        )

        if context_id:
            stmt = stmt.where(UserRoleAssignment.context_id == context_id)

        result = await db.execute(stmt)
        return result.scalars().all()

    async def _get_inherited_roles(
        self, db: AsyncSession, user_id: int, context_id: Optional[int] = None
    ) -> List[EnhancedRole]:
        """Получить унаследованные роли через команды."""
        # Логика наследования ролей через команды/проекты
        # Пока возвращаем пустой список, может быть расширено
        return []


class RoleAuditLogger:
    """Логгер аудита операций с ролями."""

    def __init__(self):
        self._audit_log: List[Dict[str, Any]] = []

    def log_role_operation(
        self,
        operation: RoleOperationType,
        role_id: int,
        user_id: Optional[int] = None,
        performer_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        """Логировать операцию с ролью."""
        audit_entry = {
            "timestamp": datetime.utcnow(),
            "operation": operation.value,
            "role_id": role_id,
            "user_id": user_id,
            "performer_id": performer_id,
            "context": context or {},
        }

        self._audit_log.append(audit_entry)

        logger.info(
            f"Role audit: {operation.value} role {role_id} by user {performer_id}"
        )

    def get_audit_log(
        self,
        role_id: Optional[int] = None,
        user_id: Optional[int] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Получить журнал аудита."""
        filtered_log = self._audit_log

        if role_id:
            filtered_log = [
                entry for entry in filtered_log if entry["role_id"] == role_id
            ]

        if user_id:
            filtered_log = [
                entry for entry in filtered_log if entry["user_id"] == user_id
            ]

        return filtered_log[-limit:]


class RoleService(BaseService):
    """
    Основной сервис ролей.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными ролей)
    - Strategy (разные валидаторы)
    - Command (операции с ролями)
    - Observer (аудит операций)
    """

    def __init__(self):
        self._repository: IRoleRepository = DatabaseRoleRepository()
        self._validator: IRoleValidator = StandardRoleValidator()
        self._hierarchy_manager: IRoleHierarchyManager = RoleHierarchyManager()
        self._audit_logger = RoleAuditLogger()
        super().__init__()

    def get_service_name(self) -> str:
        return "RoleService"

    def set_repository(self, repository: IRoleRepository):
        """Установить репозиторий ролей."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: IRoleValidator):
        """Установить валидатор ролей."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def get_all_roles(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        scope: Optional[RoleScope] = None,
    ) -> List[EnhancedRole]:
        """Получить все роли с фильтрацией."""
        try:
            self._log_operation(
                "get_all_roles",
                {"skip": skip, "limit": limit, "scope": scope.value if scope else None},
            )

            if scope:
                return await self._repository.get_roles_by_scope(db, scope, skip, limit)
            else:
                return await enhanced_role.get_multi(db, skip=skip, limit=limit)

        except Exception as e:
            raise self._handle_error(e, "get_all_roles")

    async def create_role(
        self,
        db: AsyncSession,
        name: str,
        display_name: str,
        scope: RoleScope,
        permissions: List[str],
        description: Optional[str] = None,
        role_level: int = 0,
        creator_id: Optional[int] = None,
    ) -> EnhancedRole:
        """Создать новую роль."""
        try:
            self._log_operation(
                "create_role",
                {
                    "name": name,
                    "scope": scope.value,
                    "permissions_count": len(permissions),
                },
            )

            # Подготовка данных роли
            role_data = {
                "name": name,
                "display_name": display_name,
                "scope": scope,
                "permissions_config": {"permissions": permissions, "attributes": ["*"]},
                "description": description,
                "role_level": role_level,
                "is_active": True,
                "is_template": False,
            }

            # Валидация
            await self._validator.validate_role_creation(db, role_data)

            # Создание роли
            role = await self._repository.create_role(db, role_data)

            # Аудит
            self._audit_logger.log_role_operation(
                RoleOperationType.CREATE,
                role.id,
                performer_id=creator_id,
                context={"name": name, "scope": scope.value},
            )

            return role

        except Exception as e:
            raise self._handle_error(e, "create_role")

    async def update_role(
        self,
        db: AsyncSession,
        role_id: int,
        updates: Dict[str, Any],
        updater_id: Optional[int] = None,
    ) -> EnhancedRole:
        """Обновить роль."""
        try:
            self._log_operation(
                "update_role", {"role_id": role_id, "updates_count": len(updates)}
            )

            # Обновление роли
            role = await self._repository.update_role(db, role_id, updates)

            # Аудит
            self._audit_logger.log_role_operation(
                RoleOperationType.UPDATE,
                role_id,
                performer_id=updater_id,
                context={"updates": list(updates.keys())},
            )

            return role

        except Exception as e:
            raise self._handle_error(e, "update_role")

    async def assign_role_to_user(
        self,
        db: AsyncSession,
        user: User,
        role_id: int,
        context_id: Optional[int] = None,
        assigned_by: Optional[int] = None,
        expires_at: Optional[datetime] = None,
    ) -> UserRoleAssignment:
        """Назначить роль пользователю."""
        try:
            self._log_operation(
                "assign_role_to_user",
                {"user_id": user.id, "role_id": role_id, "context_id": context_id},
            )

            # Получение роли
            role = await self._repository.get_role_by_id(db, role_id)
            if not role:
                raise RoleNotFoundError(f"Role with ID {role_id} not found")

            # Валидация
            await self._validator.validate_role_assignment(db, user, role, context_id)

            # Создание назначения
            assignment_data = {
                "user_id": user.id,
                "role_id": role_id,
                "context_id": context_id,
                "assigned_by": assigned_by,
                "assigned_at": datetime.utcnow(),
                "expires_at": expires_at,
            }

            assignment = await user_role_assignment.create(db, obj_in=assignment_data)

            # Аудит
            self._audit_logger.log_role_operation(
                RoleOperationType.ASSIGN,
                role_id,
                user_id=user.id,
                performer_id=assigned_by,
                context={"context_id": context_id},
            )

            return assignment

        except Exception as e:
            raise self._handle_error(e, "assign_role_to_user")

    async def revoke_role_from_user(
        self,
        db: AsyncSession,
        user_id: int,
        role_id: int,
        context_id: Optional[int] = None,
        revoked_by: Optional[int] = None,
    ) -> bool:
        """Отозвать роль у пользователя."""
        try:
            self._log_operation(
                "revoke_role_from_user",
                {"user_id": user_id, "role_id": role_id, "context_id": context_id},
            )

            # Поиск назначения
            stmt = select(UserRoleAssignment).where(
                and_(
                    UserRoleAssignment.user_id == user_id,
                    UserRoleAssignment.role_id == role_id,
                    UserRoleAssignment.context_id == context_id,
                )
            )
            result = await db.execute(stmt)
            assignment = result.scalar_one_or_none()

            if not assignment:
                raise RoleNotFoundError("Role assignment not found")

            # Удаление назначения
            await user_role_assignment.remove(db, id=assignment.id)

            # Аудит
            self._audit_logger.log_role_operation(
                RoleOperationType.REVOKE,
                role_id,
                user_id=user_id,
                performer_id=revoked_by,
                context={"context_id": context_id},
            )

            return True

        except Exception as e:
            raise self._handle_error(e, "revoke_role_from_user")

    async def get_user_permissions(
        self, db: AsyncSession, user: User, context_id: Optional[int] = None
    ) -> Set[str]:
        """Получить все разрешения пользователя с учетом иерархии ролей."""
        try:
            self._log_operation(
                "get_user_permissions", {"user_id": user.id, "context_id": context_id}
            )

            # Получаем базовые разрешения через старый механизм
            base_permissions = await self._hierarchy_manager.get_inherited_permissions(
                db, user, context_id
            )

            # Получаем роли пользователя
            user_assignments = await user_role_assignment.get_user_assignments(
                db, user_id=user.id
            )

            # Для каждой роли получаем эффективные разрешения с учетом иерархии
            all_permissions = base_permissions.copy()

            for assignment in user_assignments:
                if assignment.is_valid:
                    role_permissions = (
                        await role_hierarchy_service.get_role_effective_permissions(
                            db, assignment.role_id
                        )
                    )
                    all_permissions.update(role_permissions)

            return all_permissions

        except Exception as e:
            raise self._handle_error(e, "get_user_permissions")

    async def search_roles(
        self, db: AsyncSession, query: str, scope: Optional[RoleScope] = None
    ) -> List[EnhancedRole]:
        """Поиск ролей по запросу."""
        try:
            self._log_operation(
                "search_roles",
                {"query": query, "scope": scope.value if scope else None},
            )

            return await self._repository.search_roles(db, query, scope)

        except Exception as e:
            raise self._handle_error(e, "search_roles")

    def get_audit_log(
        self,
        role_id: Optional[int] = None,
        user_id: Optional[int] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Получить журнал аудита операций с ролями."""
        try:
            self._log_operation(
                "get_audit_log",
                {"role_id": role_id, "user_id": user_id, "limit": limit},
            )

            return self._audit_logger.get_audit_log(role_id, user_id, limit)

        except Exception as e:
            raise self._handle_error(e, "get_audit_log")

    # =============================================================================
    # Методы для работы с иерархией ролей (DAG)
    # =============================================================================

    async def create_role_inheritance(
        self,
        db: AsyncSession,
        parent_role_id: int,
        child_role_id: int,
        inheritance_type: InheritanceType = InheritanceType.FULL,
        conditions: Optional[Dict[str, Any]] = None,
        priority: int = 0,
        created_by: Optional[int] = None,
    ) -> RoleHierarchy:
        """
        Создать связь наследования между ролями.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли
            inheritance_type: Тип наследования
            conditions: Условия наследования
            priority: Приоритет наследования
            created_by: ID создателя

        Returns:
            Созданная связь наследования
        """
        try:
            self._log_operation(
                "create_role_inheritance",
                {
                    "parent_role_id": parent_role_id,
                    "child_role_id": child_role_id,
                    "inheritance_type": inheritance_type.value,
                },
            )

            # Используем сервис иерархии для создания связи
            hierarchy = await role_hierarchy_service.create_inheritance(
                db=db,
                parent_role_id=parent_role_id,
                child_role_id=child_role_id,
                inheritance_type=inheritance_type,
                conditions=conditions,
                created_by=created_by,
            )

            # Аудит
            self._audit_logger.log_role_operation(
                RoleOperationType.CREATE,
                child_role_id,
                performer_id=created_by,
                context={
                    "operation": "create_inheritance",
                    "parent_role_id": parent_role_id,
                    "inheritance_type": inheritance_type.value,
                },
            )

            return hierarchy

        except Exception as e:
            raise self._handle_error(e, "create_role_inheritance")

    async def remove_role_inheritance(
        self,
        db: AsyncSession,
        parent_role_id: int,
        child_role_id: int,
        removed_by: Optional[int] = None,
    ) -> bool:
        """
        Удалить связь наследования между ролями.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли
            removed_by: ID удаляющего

        Returns:
            True если связь была удалена
        """
        try:
            self._log_operation(
                "remove_role_inheritance",
                {"parent_role_id": parent_role_id, "child_role_id": child_role_id},
            )

            # Находим связь
            hierarchy = await role_hierarchy.get_by_parent_child(
                db, parent_role_id=parent_role_id, child_role_id=child_role_id
            )

            if not hierarchy:
                raise RoleNotFoundError("Связь наследования не найдена")

            # Деактивируем связь
            deactivated = await role_hierarchy.deactivate_relationship(
                db, relationship_id=hierarchy.id
            )

            if deactivated:
                # Аудит
                self._audit_logger.log_role_operation(
                    RoleOperationType.DELETE,
                    child_role_id,
                    performer_id=removed_by,
                    context={
                        "operation": "remove_inheritance",
                        "parent_role_id": parent_role_id,
                    },
                )

                return True

            return False

        except Exception as e:
            raise self._handle_error(e, "remove_role_inheritance")

    async def get_role_ancestors(
        self, db: AsyncSession, role_id: int
    ) -> List[EnhancedRole]:
        """
        Получить всех предков роли.

        Args:
            db: Сессия базы данных
            role_id: ID роли

        Returns:
            Список предков ролей
        """
        try:
            self._log_operation("get_role_ancestors", {"role_id": role_id})

            ancestor_ids = await role_hierarchy_service.get_role_ancestors(db, role_id)

            # Получаем полные данные ролей
            ancestors = []
            for ancestor_id in ancestor_ids:
                ancestor = await self._repository.get_role_by_id(db, ancestor_id)
                if ancestor:
                    ancestors.append(ancestor)

            return ancestors

        except Exception as e:
            raise self._handle_error(e, "get_role_ancestors")

    async def get_role_descendants(
        self, db: AsyncSession, role_id: int
    ) -> List[EnhancedRole]:
        """
        Получить всех потомков роли.

        Args:
            db: Сессия базы данных
            role_id: ID роли

        Returns:
            Список потомков ролей
        """
        try:
            self._log_operation("get_role_descendants", {"role_id": role_id})

            descendant_ids = await role_hierarchy_service.get_role_descendants(
                db, role_id
            )

            # Получаем полные данные ролей
            descendants = []
            for descendant_id in descendant_ids:
                descendant = await self._repository.get_role_by_id(db, descendant_id)
                if descendant:
                    descendants.append(descendant)

            return descendants

        except Exception as e:
            raise self._handle_error(e, "get_role_descendants")

    async def get_role_effective_permissions(
        self, db: AsyncSession, role_id: int
    ) -> Set[str]:
        """
        Получить эффективные разрешения роли с учетом наследования.

        Args:
            db: Сессия базы данных
            role_id: ID роли

        Returns:
            Множество эффективных разрешений
        """
        try:
            self._log_operation("get_role_effective_permissions", {"role_id": role_id})

            return await role_hierarchy_service.get_role_effective_permissions(
                db, role_id
            )

        except Exception as e:
            raise self._handle_error(e, "get_role_effective_permissions")

    async def validate_role_inheritance(
        self, db: AsyncSession, parent_role_id: int, child_role_id: int
    ) -> Tuple[bool, List[str]]:
        """
        Валидировать возможность создания связи наследования.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли

        Returns:
            Кортеж (валидно, список ошибок)
        """
        try:
            self._log_operation(
                "validate_role_inheritance",
                {"parent_role_id": parent_role_id, "child_role_id": child_role_id},
            )

            errors = []

            # Проверяем через сервис иерархии
            try:
                is_valid = await role_hierarchy_service.validate_inheritance(
                    db, parent_role_id, child_role_id
                )
                return is_valid, errors
            except Exception as e:
                errors.append(str(e))
                return False, errors

        except Exception as e:
            raise self._handle_error(e, "validate_role_inheritance")

    async def find_inheritance_path(
        self, db: AsyncSession, source_role_id: int, target_role_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Найти путь наследования между ролями.

        Args:
            db: Сессия базы данных
            source_role_id: ID исходной роли
            target_role_id: ID целевой роли

        Returns:
            Путь наследования или None
        """
        try:
            self._log_operation(
                "find_inheritance_path",
                {"source_role_id": source_role_id, "target_role_id": target_role_id},
            )

            path = await role_hierarchy_service.find_inheritance_path(
                db, source_role_id, target_role_id
            )

            if path:
                return {
                    "source_role_id": path.source_role_id,
                    "target_role_id": path.target_role_id,
                    "path": path.path,
                    "effective_permissions": list(path.effective_permissions),
                    "inheritance_rules": [
                        {
                            "parent_role_id": rule.parent_role_id,
                            "child_role_id": rule.child_role_id,
                            "inheritance_type": rule.inheritance_type.value,
                            "priority": rule.priority,
                        }
                        for rule in path.inheritance_rules
                    ],
                }

            return None

        except Exception as e:
            raise self._handle_error(e, "find_inheritance_path")

    async def get_hierarchy_conflicts(
        self, db: AsyncSession, role_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Найти конфликты в иерархии ролей.

        Args:
            db: Сессия базы данных
            role_id: ID роли (если None, проверяем все роли)

        Returns:
            Список конфликтов
        """
        try:
            self._log_operation("get_hierarchy_conflicts", {"role_id": role_id})

            if role_id:
                return await role_hierarchy.get_inheritance_conflicts(
                    db, role_id=role_id
                )
            else:
                # Проверяем все роли
                all_roles = await enhanced_role.get_multi(db)
                all_conflicts = []

                for role in all_roles:
                    conflicts = await role_hierarchy.get_inheritance_conflicts(
                        db, role_id=role.id
                    )
                    all_conflicts.extend(conflicts)

                return all_conflicts

        except Exception as e:
            raise self._handle_error(e, "get_hierarchy_conflicts")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("role", RoleService)

# Singleton instance
role_service = RoleService()
