"""
Department Service.

Сервис для управления департаментами с полным циклом операций CRUD.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Tuple
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.crud.department import department as department_crud
from app.crud.user import user as user_crud
from app.crud.company import company as company_crud
from app.models.department import Department
from app.models.user import User
from app.services.permission_service import permission_service
from app.core.constants import Permission, RoleScope
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentHierarchy,
    DepartmentStats,
)
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class DepartmentServiceError(ServiceError):
    """Ошибки сервиса департаментов."""

    pass


class DepartmentNotFoundError(DepartmentServiceError):
    """Департамент не найден."""

    def __init__(self, department_id: int):
        super().__init__(
            f"Department with id {department_id} not found", "DEPARTMENT_NOT_FOUND"
        )


class DepartmentValidationError(DepartmentServiceError):
    """Ошибки валидации департамента."""

    pass


# Абстрактные интерфейсы
class IDepartmentRepository(ABC):
    """Интерфейс репозитория департаментов."""

    @abstractmethod
    async def get_by_id(
        self, db: AsyncSession, department_id: int
    ) -> Optional[Department]:
        """Получить департамент по ID."""
        pass

    @abstractmethod
    async def get_by_company(
        self,
        db: AsyncSession,
        company_id: int,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
    ) -> List[Department]:
        """Получить департаменты компании."""
        pass

    @abstractmethod
    async def create(
        self, db: AsyncSession, department_data: DepartmentCreate
    ) -> Department:
        """Создать департамент."""
        pass

    @abstractmethod
    async def update(
        self, db: AsyncSession, department: Department, update_data: DepartmentUpdate
    ) -> Department:
        """Обновить департамент."""
        pass

    @abstractmethod
    async def delete(self, db: AsyncSession, department_id: int) -> bool:
        """Удалить департамент."""
        pass


class IDepartmentValidator(ABC):
    """Интерфейс валидатора департаментов."""

    @abstractmethod
    async def validate_create(
        self, db: AsyncSession, department_data: DepartmentCreate, user: User
    ) -> None:
        """Валидация создания департамента."""
        pass

    @abstractmethod
    async def validate_update(
        self,
        db: AsyncSession,
        department: Department,
        update_data: DepartmentUpdate,
        user: User,
    ) -> None:
        """Валидация обновления департамента."""
        pass


class IDepartmentPermissionChecker(ABC):
    """Интерфейс проверки прав доступа к департаментам."""

    @abstractmethod
    async def can_view_departments(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права на просмотр департаментов."""
        pass

    @abstractmethod
    async def can_manage_department(
        self, db: AsyncSession, user: User, department: Optional[Department] = None
    ) -> bool:
        """Проверить права на управление департаментом."""
        pass


# Конкретные реализации
class DepartmentRepository(IDepartmentRepository):
    """Репозиторий департаментов."""

    def __init__(self):
        self.crud = department_crud

    async def get_by_id(
        self, db: AsyncSession, department_id: int
    ) -> Optional[Department]:
        """Получить департамент по ID."""
        return await self.crud.get(db, id=department_id)

    async def get_by_company(
        self,
        db: AsyncSession,
        company_id: int,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
    ) -> List[Department]:
        """Получить департаменты компании."""
        return await self.crud.get_by_company(
            db,
            company_id=company_id,
            skip=skip,
            limit=limit,
            include_inactive=include_inactive,
        )

    async def create(
        self, db: AsyncSession, department_data: DepartmentCreate
    ) -> Department:
        """Создать департамент."""
        return await self.crud.create_with_company(
            db, obj_in=department_data, company_id=department_data.company_id
        )

    async def update(
        self, db: AsyncSession, department: Department, update_data: DepartmentUpdate
    ) -> Department:
        """Обновить департамент."""
        return await self.crud.update(db, db_obj=department, obj_in=update_data)

    async def delete(self, db: AsyncSession, department_id: int) -> bool:
        """Удалить департамент."""
        await self.crud.remove(db, id=department_id)
        return True


class DepartmentBusinessValidator(IDepartmentValidator):
    """Валидатор бизнес-правил для департаментов."""

    async def validate_create(
        self, db: AsyncSession, department_data: DepartmentCreate, user: User
    ) -> None:
        """Валидация создания департамента."""
        # Проверить существование компании
        company = await company_crud.get(db, id=department_data.company_id)
        if not company:
            raise DepartmentValidationError("Company not found")

        # Проверить уникальность slug в рамках компании
        if department_data.slug:
            existing = await department_crud.get_by_slug(
                db, company_id=department_data.company_id, slug=department_data.slug
            )
            if existing:
                raise DepartmentValidationError(
                    "Department with this slug already exists"
                )

        # Проверить родительский департамент
        if department_data.parent_id:
            parent = await department_crud.get(db, id=department_data.parent_id)
            if not parent:
                raise DepartmentValidationError("Parent department not found")

            if parent.company_id != department_data.company_id:
                raise DepartmentValidationError(
                    "Parent department must be in the same company"
                )

        # Проверить руководителя
        if department_data.head_id:
            head = await user_crud.get(db, id=department_data.head_id)
            if not head:
                raise DepartmentValidationError("Department head not found")

    async def validate_update(
        self,
        db: AsyncSession,
        department: Department,
        update_data: DepartmentUpdate,
        user: User,
    ) -> None:
        """Валидация обновления департамента."""
        # Проверить slug на уникальность
        if update_data.slug and update_data.slug != department.slug:
            existing = await department_crud.get_by_slug(
                db, company_id=department.company_id, slug=update_data.slug
            )
            if existing:
                raise DepartmentValidationError(
                    "Department with this slug already exists"
                )

        # Проверить новый родительский департамент
        if update_data.parent_id is not None:
            if update_data.parent_id == department.id:
                raise DepartmentValidationError("Department cannot be parent of itself")

            if update_data.parent_id != 0:  # 0 означает сделать корневым
                parent = await department_crud.get(db, id=update_data.parent_id)
                if not parent:
                    raise DepartmentValidationError("Parent department not found")

                if parent.company_id != department.company_id:
                    raise DepartmentValidationError(
                        "Parent department must be in the same company"
                    )

                # Проверить на циклические зависимости
                if await self._creates_cycle(db, department.id, update_data.parent_id):
                    raise DepartmentValidationError(
                        "This would create a circular dependency"
                    )

        # Проверить нового руководителя
        if update_data.head_id:
            head = await user_crud.get(db, id=update_data.head_id)
            if not head:
                raise DepartmentValidationError("Department head not found")

    async def _creates_cycle(
        self, db: AsyncSession, department_id: int, new_parent_id: int
    ) -> bool:
        """Проверить создаст ли новый parent циклическую зависимость."""
        current_id = new_parent_id

        while current_id:
            if current_id == department_id:
                return True

            parent_dept = await department_crud.get(db, id=current_id)
            if not parent_dept:
                break

            current_id = parent_dept.parent_id

        return False


class DepartmentPermissionChecker(IDepartmentPermissionChecker):
    """Проверка прав доступа к департаментам."""

    async def can_view_departments(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права на просмотр департаментов."""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # Проверить доступ через Enhanced Role System
        return await permission_service.check_user_permission(
            db=db,
            user=user,
            permission=Permission.VIEW_PROJECT,
            scope=RoleScope.COMPANY,
            context_id=company_id,
        )

    async def can_manage_department(
        self, db: AsyncSession, user: User, department: Optional[Department] = None
    ) -> bool:
        """Проверить права на управление департаментом."""
        if user.is_system_admin:
            return True

        if department:
            if user.company_id == department.company_id and user.is_company_admin:
                return True

            # Проверить права через Enhanced Role System
            return await permission_service.check_user_permission(
                db=db,
                user=user,
                permission=Permission.MANAGE_PROJECT,
                scope=RoleScope.COMPANY,
                context_id=department.company_id,
            )

        return user.is_company_admin


class DepartmentService(BaseService):
    """
    Основной сервис для управления департаментами.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы)
    - Template Method (процесс создания/обновления)
    """

    def __init__(self):
        self._repository: IDepartmentRepository = DepartmentRepository()
        self._validator: IDepartmentValidator = DepartmentBusinessValidator()
        self._permission_checker: IDepartmentPermissionChecker = (
            DepartmentPermissionChecker()
        )
        super().__init__()

    def get_service_name(self) -> str:
        return "DepartmentService"

    def set_repository(self, repository: IDepartmentRepository):
        """Установить репозиторий департаментов."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: IDepartmentValidator):
        """Установить валидатор департаментов."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def create_department(
        self, db: AsyncSession, department_data: DepartmentCreate, current_user: User
    ) -> Department:
        """Создать новый департамент."""
        try:
            self._log_operation(
                "create_department",
                {
                    "name": department_data.name,
                    "company_id": department_data.company_id,
                    "user_id": current_user.id,
                },
            )

            # Проверить права на создание департамента
            if not await self._permission_checker.can_manage_department(
                db, current_user
            ):
                raise PermissionError("Insufficient permissions to create department")

            # Валидация данных
            await self._validator.validate_create(db, department_data, current_user)

            # Создание департамента
            department = await self._repository.create(db, department_data)

            logger.info(
                f"Department created successfully: {department.id} - {department.name}"
            )
            return department

        except Exception as e:
            raise self._handle_error(e, "create_department")

    async def get_department(
        self, db: AsyncSession, department_id: int, current_user: User
    ) -> Department:
        """Получить департамент по ID."""
        try:
            self._log_operation(
                "get_department",
                {"department_id": department_id, "user_id": current_user.id},
            )

            department = await self._repository.get_by_id(db, department_id)
            if not department:
                raise DepartmentNotFoundError(department_id)

            # Проверить права доступа
            if not await self._permission_checker.can_view_departments(
                db, current_user, department.company_id
            ):
                raise PermissionError("Access denied to department")

            return department

        except Exception as e:
            raise self._handle_error(e, "get_department")

    async def get_company_departments(
        self,
        db: AsyncSession,
        company_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        include_inactive: bool = False,
    ) -> List[Department]:
        """Получить департаменты компании."""
        try:
            self._log_operation(
                "get_company_departments",
                {
                    "company_id": company_id,
                    "user_id": current_user.id,
                    "skip": skip,
                    "limit": limit,
                },
            )

            # Проверить права доступа к компании
            if not await self._permission_checker.can_view_departments(
                db, current_user, company_id
            ):
                raise PermissionError("Access denied to company departments")

            departments = await self._repository.get_by_company(
                db,
                company_id=company_id,
                skip=skip,
                limit=limit,
                include_inactive=include_inactive,
            )

            return departments

        except Exception as e:
            raise self._handle_error(e, "get_company_departments")

    async def update_department(
        self,
        db: AsyncSession,
        department_id: int,
        department_data: DepartmentUpdate,
        current_user: User,
    ) -> Department:
        """Обновить департамент."""
        try:
            self._log_operation(
                "update_department",
                {"department_id": department_id, "user_id": current_user.id},
            )

            department = await self._repository.get_by_id(db, department_id)
            if not department:
                raise DepartmentNotFoundError(department_id)

            # Проверить права на редактирование
            if not await self._permission_checker.can_manage_department(
                db, current_user, department
            ):
                raise PermissionError("Insufficient permissions to edit department")

            # Валидация данных
            await self._validator.validate_update(
                db, department, department_data, current_user
            )

            # Обновление департамента
            department = await self._repository.update(db, department, department_data)

            logger.info(f"Department updated successfully: {department_id}")
            return department

        except Exception as e:
            raise self._handle_error(e, "update_department")

    async def delete_department(
        self, db: AsyncSession, department_id: int, current_user: User
    ) -> bool:
        """Удалить департамент."""
        try:
            self._log_operation(
                "delete_department",
                {"department_id": department_id, "user_id": current_user.id},
            )

            department = await self._repository.get_by_id(db, department_id)
            if not department:
                raise DepartmentNotFoundError(department_id)

            # Проверить права на удаление
            if not await self._permission_checker.can_manage_department(
                db, current_user, department
            ):
                raise PermissionError("Insufficient permissions to delete department")

            # Проверить возможность удаления
            can_delete_result = await department_crud.can_delete(
                db, department_id=department_id
            )
            if not can_delete_result["can_delete"]:
                raise DepartmentValidationError(can_delete_result["reason"])

            # Удаление департамента
            success = await self._repository.delete(db, department_id)

            if success:
                logger.info(f"Department deleted successfully: {department_id}")

            return success

        except Exception as e:
            raise self._handle_error(e, "delete_department")

    async def get_department_statistics(
        self, db: AsyncSession, department_id: int, current_user: User
    ) -> DepartmentStats:
        """Получить статистику департамента."""
        try:
            self._log_operation(
                "get_department_statistics",
                {"department_id": department_id, "user_id": current_user.id},
            )

            department = await self._repository.get_by_id(db, department_id)
            if not department:
                raise DepartmentNotFoundError(department_id)

            if not await self._permission_checker.can_view_departments(
                db, current_user, department.company_id
            ):
                raise PermissionError("Access denied to department")

            stats = await department_crud.get_statistics(
                db, department_id=department_id
            )
            return DepartmentStats(**stats)

        except Exception as e:
            raise self._handle_error(e, "get_department_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("department", DepartmentService)

# Singleton instance
department_service = DepartmentService()
