"""
Test Case Management Service.

Сервис для управления тестовыми случаями с полным циклом операций CRUD.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC

from app.crud.test_case import test_case as test_case_crud
from app.models.test_case import TestCase, TestCaseStatus, TestPlan, TestExecution
from app.models.user import User
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
    TestCaseResponse,
    TestCaseStatistics,
    TestExecutionCreate,
    TestExecutionResponse,
)
from app.core.constants import Permission
from app.utils.logger import logger
from app.core.security import EnhancedRolePermissionChecker
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class TestCaseServiceError(ServiceError):
    """Ошибки сервиса тестовых случаев."""

    pass


class TestCaseNotFoundError(TestCaseServiceError):
    """Тестовый случай не найден."""

    def __init__(self, test_case_id: int):
        super().__init__(
            f"Test case with id {test_case_id} not found", "TEST_CASE_NOT_FOUND"
        )


class TestCaseValidationError(TestCaseServiceError):
    """Ошибки валидации тестового случая."""

    pass


class TestExecutionError(TestCaseServiceError):
    """Ошибки выполнения тестов."""

    pass


# Абстрактные интерфейсы
class ITestCaseRepository(ABC):
    """Интерфейс репозитория тестовых случаев."""

    @abstractmethod
    async def get_by_id(
        self, db: AsyncSession, test_case_id: int
    ) -> Optional[TestCase]:
        pass

    @abstractmethod
    async def create(
        self, db: AsyncSession, test_case_data: TestCaseCreate
    ) -> TestCase:
        pass

    @abstractmethod
    async def update(
        self, db: AsyncSession, test_case: TestCase, update_data: TestCaseUpdate
    ) -> TestCase:
        pass

    @abstractmethod
    async def delete(self, db: AsyncSession, test_case_id: int) -> bool:
        pass


class ITestCaseValidator(ABC):
    """Интерфейс валидатора тестовых случаев."""

    @abstractmethod
    async def validate_create(
        self, db: AsyncSession, test_case_data: TestCaseCreate
    ) -> None:
        pass


class ITestCasePermissionChecker(ABC):
    """Интерфейс проверки прав доступа к тестовым случаям."""

    @abstractmethod
    async def can_create_test_case(self, db: AsyncSession, user: User) -> bool:
        pass

    @abstractmethod
    async def can_edit_test_case(
        self, db: AsyncSession, user: User, test_case_id: int
    ) -> bool:
        pass


# Конкретные реализации
class TestCaseRepository(ITestCaseRepository):
    """Репозиторий для работы с тестовыми случаями."""

    def __init__(self):
        self.crud = test_case_crud

    async def get_by_id(
        self, db: AsyncSession, test_case_id: int
    ) -> Optional[TestCase]:
        return await self.crud.get(db, id=test_case_id)

    async def create(
        self, db: AsyncSession, test_case_data: TestCaseCreate
    ) -> TestCase:
        return await self.crud.create(db, obj_in=test_case_data)

    async def update(
        self, db: AsyncSession, test_case: TestCase, update_data: TestCaseUpdate
    ) -> TestCase:
        return await self.crud.update(db, db_obj=test_case, obj_in=update_data)

    async def delete(self, db: AsyncSession, test_case_id: int) -> bool:
        return await self.crud.remove(db, id=test_case_id)


class TestCaseBusinessValidator(ITestCaseValidator):
    """Валидатор бизнес-правил для тестовых случаев."""

    async def validate_create(
        self, db: AsyncSession, test_case_data: TestCaseCreate
    ) -> None:
        if not test_case_data.name or len(test_case_data.name.strip()) < 3:
            raise TestCaseValidationError(
                "Test case name must be at least 3 characters long"
            )

        if not test_case_data.description:
            raise TestCaseValidationError("Test case description is required")


class TestCasePermissionChecker(ITestCasePermissionChecker):
    """Проверка прав доступа к тестовым случаям."""

    async def can_create_test_case(self, db: AsyncSession, user: User) -> bool:
        return EnhancedRolePermissionChecker.has_permission(
            user, Permission.CREATE_TEST_CASE
        )

    async def can_edit_test_case(
        self, db: AsyncSession, user: User, test_case_id: int
    ) -> bool:
        test_case = await test_case_crud.get(db, id=test_case_id)
        if test_case and test_case.author_id == user.id:
            return True

        return EnhancedRolePermissionChecker.has_permission(
            user, Permission.EDIT_TEST_CASE
        )


class TestCaseManagementService(BaseService):
    """
    Основной сервис для управления тестовыми случаями.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (для валидации)
    - Template Method (для основных операций)
    """

    def __init__(self):
        self._repository = TestCaseRepository()
        self._validator = TestCaseBusinessValidator()
        self._permission_checker = TestCasePermissionChecker()
        super().__init__()

    def get_service_name(self) -> str:
        return "TestCaseManagementService"

    async def create_test_case(
        self,
        db: AsyncSession,
        test_case_data: TestCaseCreate,
        current_user: User,
    ) -> TestCaseResponse:
        """Создание тестового случая."""
        try:
            self._log_operation(
                "create_test_case",
                {
                    "test_case_name": test_case_data.name,
                    "current_user_id": current_user.id,
                },
            )

            # Проверка прав на создание
            if not await self._permission_checker.can_create_test_case(
                db, current_user
            ):
                raise PermissionError("Insufficient permissions to create test case")

            # Валидация данных
            await self._validator.validate_create(db, test_case_data)

            # Установка автора
            test_case_data.author_id = current_user.id

            # Создание тестового случая
            test_case = await self._repository.create(db, test_case_data)

            logger.info(f"Test case created: {test_case.id}")
            return TestCaseResponse.from_orm(test_case)

        except Exception as e:
            raise self._handle_error(e, "create_test_case")

    async def get_test_case(
        self,
        db: AsyncSession,
        test_case_id: int,
        current_user: User,
    ) -> TestCaseResponse:
        """Получение тестового случая по ID."""
        try:
            self._log_operation(
                "get_test_case",
                {"test_case_id": test_case_id, "current_user_id": current_user.id},
            )

            test_case = await self._repository.get_by_id(db, test_case_id)
            if not test_case:
                raise TestCaseNotFoundError(test_case_id)

            return TestCaseResponse.from_orm(test_case)

        except Exception as e:
            raise self._handle_error(e, "get_test_case")

    async def update_test_case(
        self,
        db: AsyncSession,
        test_case_id: int,
        update_data: TestCaseUpdate,
        current_user: User,
    ) -> TestCaseResponse:
        """Обновление тестового случая."""
        try:
            self._log_operation(
                "update_test_case",
                {"test_case_id": test_case_id, "current_user_id": current_user.id},
            )

            # Проверка прав на редактирование
            if not await self._permission_checker.can_edit_test_case(
                db, current_user, test_case_id
            ):
                raise PermissionError("Insufficient permissions to edit test case")

            # Получение существующего тестового случая
            test_case = await self._repository.get_by_id(db, test_case_id)
            if not test_case:
                raise TestCaseNotFoundError(test_case_id)

            # Обновление тестового случая
            updated_test_case = await self._repository.update(
                db, test_case, update_data
            )

            logger.info(f"Test case updated: {test_case_id}")
            return TestCaseResponse.from_orm(updated_test_case)

        except Exception as e:
            raise self._handle_error(e, "update_test_case")

    async def delete_test_case(
        self,
        db: AsyncSession,
        test_case_id: int,
        current_user: User,
    ) -> bool:
        """Удаление тестового случая."""
        try:
            self._log_operation(
                "delete_test_case",
                {"test_case_id": test_case_id, "current_user_id": current_user.id},
            )

            # Проверка прав на редактирование
            if not await self._permission_checker.can_edit_test_case(
                db, current_user, test_case_id
            ):
                raise PermissionError("Insufficient permissions to delete test case")

            # Проверка существования
            test_case = await self._repository.get_by_id(db, test_case_id)
            if not test_case:
                raise TestCaseNotFoundError(test_case_id)

            # Удаление
            success = await self._repository.delete(db, test_case_id)

            if success:
                logger.info(f"Test case deleted: {test_case_id}")

            return success

        except Exception as e:
            raise self._handle_error(e, "delete_test_case")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("test_case_management", TestCaseManagementService)

# Singleton instance
test_case_service = TestCaseManagementService()
