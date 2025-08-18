"""
Company Management Service.

Сервис для управления компаниями с полным циклом операций CRUD.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Tuple
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, UTC

from app.crud.company import company as company_crud
from app.crud.company_contact import company_contact as contact_crud
from app.crud.company_settings import company_settings as settings_crud
from app.crud.company_branding import company_branding as branding_crud
from app.crud.company_subscription import company_subscription as subscription_crud
from app.models.company import Company, CompanyStatus
from app.models.user import User
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListResponse,
    CompanyStatistics,
)
from app.core.constants import Permission, RoleScope
from app.utils.logger import logger
from app.core.security import require_system_admin, check_user_permission
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class CompanyManagementError(ServiceError):
    """Ошибки управления компаниями."""

    pass


class CompanyNotFoundError(CompanyManagementError):
    """Компания не найдена."""

    def __init__(self, company_id: int):
        super().__init__(f"Company with id {company_id} not found", "COMPANY_NOT_FOUND")


class CompanyValidationError(CompanyManagementError):
    """Ошибки валидации компании."""

    pass


# Абстрактные интерфейсы
class ICompanyRepository(ABC):
    """Интерфейс репозитория компаний."""

    @abstractmethod
    async def get_by_id(self, db: AsyncSession, company_id: int) -> Optional[Company]:
        """Получить компанию по ID."""
        pass

    @abstractmethod
    async def get_multi_with_filters(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[CompanyStatus] = None,
    ) -> Tuple[List[Company], int]:
        """Получить список компаний с фильтрами."""
        pass

    @abstractmethod
    async def create(self, db: AsyncSession, company_data: CompanyCreate) -> Company:
        """Создать новую компанию."""
        pass

    @abstractmethod
    async def update(
        self, db: AsyncSession, company: Company, update_data: CompanyUpdate
    ) -> Company:
        """Обновить компанию."""
        pass

    @abstractmethod
    async def delete(self, db: AsyncSession, company_id: int) -> bool:
        """Удалить компанию."""
        pass


class ICompanyValidator(ABC):
    """Интерфейс валидатора компаний."""

    @abstractmethod
    async def validate_create(
        self, db: AsyncSession, company_data: CompanyCreate
    ) -> None:
        """Валидация данных при создании компании."""
        pass

    @abstractmethod
    async def validate_update(
        self, db: AsyncSession, company: Company, update_data: CompanyUpdate
    ) -> None:
        """Валидация данных при обновлении компании."""
        pass


class ICompanyPermissionChecker(ABC):
    """Интерфейс проверки прав доступа к компаниям."""

    @abstractmethod
    async def can_view_companies(self, db: AsyncSession, user: User) -> bool:
        """Проверить права на просмотр компаний."""
        pass

    @abstractmethod
    async def can_manage_company(
        self, db: AsyncSession, user: User, company_id: Optional[int] = None
    ) -> bool:
        """Проверить права на управление компанией."""
        pass


# Конкретные реализации
class CompanyRepository(ICompanyRepository):
    """Репозиторий для работы с компаниями."""

    def __init__(self):
        self.crud = company_crud
        self.contact_crud = contact_crud
        self.settings_crud = settings_crud
        self.branding_crud = branding_crud
        self.subscription_crud = subscription_crud

    async def get_by_id(self, db: AsyncSession, company_id: int) -> Optional[Company]:
        """Получить компанию по ID с полной загрузкой связанных данных."""
        return await self.crud.get_with_full_relations(db, id=company_id)

    async def get_multi_with_filters(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[CompanyStatus] = None,
    ) -> Tuple[List[Company], int]:
        """Получить список компаний с фильтрами."""
        return await self.crud.get_multi_with_filters(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            status=status,
        )

    async def create(self, db: AsyncSession, company_data: CompanyCreate) -> Company:
        """Создать новую компанию."""
        return await self.crud.create(db, obj_in=company_data)

    async def update(
        self, db: AsyncSession, company: Company, update_data: CompanyUpdate
    ) -> Company:
        """Обновить компанию."""
        return await self.crud.update(db, db_obj=company, obj_in=update_data)

    async def delete(self, db: AsyncSession, company_id: int) -> bool:
        """Мягкое удаление компании."""
        company = await self.get_by_id(db, company_id)
        if not company:
            return False

        # Мягкое удаление - изменение статуса
        await self.crud.update(
            db, db_obj=company, obj_in={"status": CompanyStatus.DELETED}
        )
        return True


class CompanyBusinessValidator(ICompanyValidator):
    """Валидатор бизнес-правил для компаний."""

    async def validate_create(
        self, db: AsyncSession, company_data: CompanyCreate
    ) -> None:
        """Валидация данных при создании компании."""
        # Проверка уникальности названия компании
        existing_company = await company_crud.get_by_name(db, name=company_data.name)
        if existing_company:
            raise CompanyValidationError(
                f"Company with name '{company_data.name}' already exists"
            )

        # Проверка корректности email
        if company_data.email and "@" not in company_data.email:
            raise CompanyValidationError("Invalid email format")

        # Дополнительные бизнес-проверки
        if len(company_data.name) < 2:
            raise CompanyValidationError(
                "Company name must be at least 2 characters long"
            )

    async def validate_update(
        self, db: AsyncSession, company: Company, update_data: CompanyUpdate
    ) -> None:
        """Валидация данных при обновлении компании."""
        # Проверка уникальности названия (исключая текущую компанию)
        if update_data.name:
            existing_company = await company_crud.get_by_name(db, name=update_data.name)
            if existing_company and existing_company.id != company.id:
                raise CompanyValidationError(
                    f"Company with name '{update_data.name}' already exists"
                )

        # Проверка корректности email
        if update_data.email and "@" not in update_data.email:
            raise CompanyValidationError("Invalid email format")


class CompanyPermissionChecker(ICompanyPermissionChecker):
    """Проверка прав доступа к компаниям."""

    async def can_view_companies(self, db: AsyncSession, user: User) -> bool:
        """Проверить права на просмотр компаний."""
        return await check_user_permission(db, user, Permission.VIEW_COMPANIES)

    async def can_manage_company(
        self, db: AsyncSession, user: User, company_id: Optional[int] = None
    ) -> bool:
        """Проверить права на управление компанией."""
        # Системные администраторы могут управлять любыми компаниями
        if await check_user_permission(db, user, Permission.SYSTEM_ADMIN):
            return True

        # Проверка прав на управление компаниями
        return await check_user_permission(db, user, Permission.MANAGE_COMPANIES)


class CompanyStatisticsCalculator:
    """Калькулятор статистики компаний."""

    @staticmethod
    async def calculate_company_statistics(
        db: AsyncSession, company: Company
    ) -> CompanyStatistics:
        """Вычислить статистику компании."""
        # Здесь должна быть логика вычисления статистики
        # Пример базовых метрик
        user_count = await company_crud.get_company_users_count(db, company.id)
        project_count = await company_crud.get_company_projects_count(db, company.id)

        return CompanyStatistics(
            id=company.id,
            name=company.name,
            user_count=user_count,
            project_count=project_count,
            created_at=company.created_at,
            status=company.status,
            # Дополнительные метрики...
        )


class CompanyManagementService(BaseService):
    """
    Основной сервис для управления компаниями.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (для валидации и проверки прав)
    - Template Method (для основных операций)
    - Facade (объединяет несколько подсистем)
    """

    def __init__(self):
        self._repository = CompanyRepository()
        self._validator = CompanyBusinessValidator()
        self._permission_checker = CompanyPermissionChecker()
        self._statistics_calculator = CompanyStatisticsCalculator()
        super().__init__()

    def get_service_name(self) -> str:
        return "CompanyManagementService"

    async def get_companies_list(
        self,
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[CompanyStatus] = None,
    ) -> Dict[str, Any]:
        """
        Получить список компаний с фильтрацией и пагинацией.

        Args:
            db: Сессия базы данных
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            search: Поисковый запрос
            status: Фильтр по статусу
            current_user: Текущий пользователь

        Returns:
            Dict содержащий список компаний и метаданные пагинации
        """
        try:
            self._log_operation(
                "get_companies_list",
                {
                    "skip": skip,
                    "limit": limit,
                    "search": search,
                    "status": status,
                    "current_user_id": current_user.id,
                },
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_companies(db, current_user):
                raise PermissionError("Insufficient permissions to view companies")

            # Получение списка компаний
            companies, total = await self._repository.get_multi_with_filters(
                db=db,
                skip=skip,
                limit=limit,
                search=search,
                status=status,
            )

            logger.info(
                f"Retrieved {len(companies)} companies for user {current_user.id}, "
                f"total: {total}, filters: search='{search}', status='{status}'"
            )

            return {
                "companies": companies,
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_next": (skip + len(companies)) < total,
                "has_prev": skip > 0,
            }

        except Exception as e:
            raise self._handle_error(e, "get_companies_list")

    async def get_company_by_id(
        self,
        db: AsyncSession,
        company_id: int,
        current_user: User,
    ) -> Company:
        """
        Получить компанию по ID.

        Args:
            db: Сессия базы данных
            company_id: ID компании
            current_user: Текущий пользователь

        Returns:
            Company: Объект компании
        """
        try:
            self._log_operation(
                "get_company_by_id",
                {"company_id": company_id, "current_user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_companies(db, current_user):
                raise PermissionError("Insufficient permissions to view company")

            company = await self._repository.get_by_id(db, company_id)
            if not company:
                raise CompanyNotFoundError(company_id)

            return company

        except Exception as e:
            raise self._handle_error(e, "get_company_by_id")

    async def create_company(
        self,
        db: AsyncSession,
        company_data: CompanyCreate,
        current_user: User,
    ) -> Company:
        """
        Создать новую компанию.

        Args:
            db: Сессия базы данных
            company_data: Данные новой компании
            current_user: Текущий пользователь

        Returns:
            Company: Созданная компания
        """
        try:
            self._log_operation(
                "create_company",
                {"company_name": company_data.name, "current_user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_manage_company(db, current_user):
                raise PermissionError("Insufficient permissions to create company")

            # Валидация данных
            await self._validator.validate_create(db, company_data)

            # Создание компании
            company = await self._repository.create(db, company_data)

            logger.info(f"Company created successfully: {company.id} - {company.name}")
            return company

        except Exception as e:
            raise self._handle_error(e, "create_company")

    async def update_company(
        self,
        db: AsyncSession,
        company_id: int,
        update_data: CompanyUpdate,
        current_user: User,
    ) -> Company:
        """
        Обновить компанию.

        Args:
            db: Сессия базы данных
            company_id: ID компании
            update_data: Данные для обновления
            current_user: Текущий пользователь

        Returns:
            Company: Обновленная компания
        """
        try:
            self._log_operation(
                "update_company",
                {"company_id": company_id, "current_user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_manage_company(
                db, current_user, company_id
            ):
                raise PermissionError("Insufficient permissions to update company")

            # Получение существующей компании
            company = await self._repository.get_by_id(db, company_id)
            if not company:
                raise CompanyNotFoundError(company_id)

            # Валидация данных
            await self._validator.validate_update(db, company, update_data)

            # Обновление компании
            updated_company = await self._repository.update(db, company, update_data)

            logger.info(f"Company updated successfully: {company_id}")
            return updated_company

        except Exception as e:
            raise self._handle_error(e, "update_company")

    async def delete_company(
        self,
        db: AsyncSession,
        company_id: int,
        current_user: User,
    ) -> bool:
        """
        Удалить компанию.

        Args:
            db: Сессия базы данных
            company_id: ID компании
            current_user: Текущий пользователь

        Returns:
            bool: Успешность удаления
        """
        try:
            self._log_operation(
                "delete_company",
                {"company_id": company_id, "current_user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_manage_company(
                db, current_user, company_id
            ):
                raise PermissionError("Insufficient permissions to delete company")

            # Проверка существования компании
            company = await self._repository.get_by_id(db, company_id)
            if not company:
                raise CompanyNotFoundError(company_id)

            # Удаление компании
            success = await self._repository.delete(db, company_id)

            if success:
                logger.info(f"Company deleted successfully: {company_id}")

            return success

        except Exception as e:
            raise self._handle_error(e, "delete_company")

    async def get_company_statistics(
        self,
        db: AsyncSession,
        company_id: int,
        current_user: User,
    ) -> CompanyStatistics:
        """
        Получить статистику компании.

        Args:
            db: Сессия базы данных
            company_id: ID компании
            current_user: Текущий пользователь

        Returns:
            CompanyStatistics: Статистика компании
        """
        try:
            self._log_operation(
                "get_company_statistics",
                {"company_id": company_id, "current_user_id": current_user.id},
            )

            # Проверка прав доступа
            if not await self._permission_checker.can_view_companies(db, current_user):
                raise PermissionError(
                    "Insufficient permissions to view company statistics"
                )

            # Получение компании
            company = await self._repository.get_by_id(db, company_id)
            if not company:
                raise CompanyNotFoundError(company_id)

            # Вычисление статистики
            statistics = await self._statistics_calculator.calculate_company_statistics(
                db, company
            )

            return statistics

        except Exception as e:
            raise self._handle_error(e, "get_company_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("company_management", CompanyManagementService)

# Singleton instance
company_management_service = CompanyManagementService()
